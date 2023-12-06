from django.urls import path
from .views import chat, chat_api

urlpatterns = [
    path('', chat, name='chat'),
    path('api/chat/', chat_api, name='chat_api'),
]