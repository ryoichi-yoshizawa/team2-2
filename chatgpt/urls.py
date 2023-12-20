# chatgpt/urls.py

from django.urls import path
from .views import ChatGPTView

urlpatterns = [
    path('', ChatGPTView.as_view(), name='chatgpt_chat'),
]
