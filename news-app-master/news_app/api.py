import os
from datetime import datetime, timedelta
from typing import List, Optional

import requests
from dateutil import tz
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from ninja import NinjaAPI, Router, Schema
from ninja.errors import HttpError
from ninja.security import django_auth


def _convert_from_utc_to_local_time(date_time: str) -> str:
    utc_zone = tz.tzutc()
    utc = datetime.strptime(date_time, "%Y-%m-%dT%H:%M:%SZ")
    utc = utc.replace(tzinfo=utc_zone)
    central = utc + timedelta(hours=2)
    return central.strftime("%Y-%b-%d %H:%M%p")


def _get_api_key() -> str:
    api_key = os.environ.get("NEWSAPI_KEY")
    if not api_key:
        raise HttpError(500, "NEWSAPI_KEY is not configured")
    return api_key


def _fetch_articles(url: str, params: dict) -> List[dict]:
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    if payload.get("status") != "ok":
        raise HttpError(502, payload.get("message", "Unexpected response from upstream provider"))

    articles = payload.get("articles", [])
    for article in articles:
        article.setdefault("source", {})
        published_at = article.get("publishedAt")
        if published_at:
            try:
                article["publishedAt"] = _convert_from_utc_to_local_time(published_at)
            except (ValueError, TypeError):
                pass

    return articles


class ArticleSourceSchema(Schema):
    id: Optional[str] = None
    name: Optional[str] = None


class ArticleSchema(Schema):
    author: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    urlToImage: Optional[str] = None
    publishedAt: Optional[str] = None
    content: Optional[str] = None
    source: Optional[ArticleSourceSchema] = None


class AuthUserSchema(Schema):
    id: int
    username: str
    email: Optional[str] = None

    class Config:
        orm_mode = True


class AuthResponseSchema(Schema):
    success: bool
    user: Optional[AuthUserSchema] = None


class LoginPayload(Schema):
    username: str
    password: str


class RegisterPayload(Schema):
    username: str
    password: str
    email: Optional[str] = None


class MessageSchema(Schema):
    detail: str


class CSRFSchema(Schema):
    csrfToken: str


api = NinjaAPI(title="Mzansi News API")

news_router = Router(tags=["news"])
auth_router = Router(tags=["auth"])


@news_router.get("/top-headlines", response=List[ArticleSchema])
def get_top_headlines(
    request,
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    country: str = "za",
):
    page_size = max(1, min(page_size, 100))
    params = {
        "apiKey": _get_api_key(),
        "country": country,
        "page": page,
        "pageSize": page_size,
    }
    if category:
        params["category"] = category

    url = "https://newsapi.org/v2/top-headlines"
    return _fetch_articles(url, params)


@news_router.get("/search", response=List[ArticleSchema], auth=django_auth)
def search_news(
    request,
    q: str,
    language: str = "en",
    sort_by: str = "publishedAt",
    page: int = 1,
    page_size: int = 20,
):
    page_size = max(1, min(page_size, 100))
    params = {
        "apiKey": _get_api_key(),
        "q": q,
        "language": language,
        "sortBy": sort_by,
        "page": page,
        "pageSize": page_size,
    }
    url = "https://newsapi.org/v2/everything"
    return _fetch_articles(url, params)


@auth_router.get("/csrf", response=CSRFSchema)
@ensure_csrf_cookie
def get_csrf(request):
    token = get_token(request)
    return {"csrfToken": token}


@auth_router.post("/login", response=AuthResponseSchema)
def login_user(request, payload: LoginPayload):
    user = authenticate(request, username=payload.username, password=payload.password)
    if user is None:
        raise HttpError(401, "Invalid username or password")

    login(request, user)
    return {"success": True, "user": AuthUserSchema.from_orm(user)}


@auth_router.post("/logout", response=MessageSchema, auth=django_auth)
def logout_user(request):
    logout(request)
    return {"detail": "Logged out"}


@auth_router.post("/register", response=AuthResponseSchema)
def register_user(request, payload: RegisterPayload):
    if User.objects.filter(username=payload.username).exists():
        raise HttpError(400, "Username is already taken")

    user = User.objects.create_user(
        username=payload.username,
        password=payload.password,
        email=payload.email or "",
    )
    login(request, user)
    return {"success": True, "user": AuthUserSchema.from_orm(user)}


@auth_router.get("/me", response=AuthResponseSchema, auth=django_auth)
def get_current_user(request):
    user = request.user
    return {"success": True, "user": AuthUserSchema.from_orm(user)}


@api.exception_handler(requests.RequestException)
def requests_exception_handler(request, exc):
    raise HttpError(502, "Unable to reach upstream news provider") from exc


api.add_router("/news", news_router)
api.add_router("/auth", auth_router)
