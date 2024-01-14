# chatgpt/views.py

import openai
from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .forms import ChatForm
from django.conf import settings

from .models import BaseballPlayer

openai.api_key = settings.OPENAI_API_KEY

class ChatGPTView(View):
    template_name = 'chatgpt/chatgpt.html'

    def get(self, request, *args, **kwargs):
        form = ChatForm()
        # データベースから最新の会話データを取得
        conversation_entries = BaseballPlayer.objects.all().order_by('-id')[:10]
        return render(request, self.template_name, {'form': form, 'conversation_entries': conversation_entries})
    
    def post(self, request, *args, **kwargs):
        form = ChatForm(request.POST)
        if form.is_valid():
            user_input = form.cleaned_data['message']
            response = self.get_chatgpt_response(user_input)
            return JsonResponse({'response': response})
        return JsonResponse({'response': 'Invalid message'})

    def get_chatgpt_response(self, user_input):
        try:
            player = BaseballPlayer.objects.get(選手名=user_input)
            response = f"{player.選手名}の守備は{player.守備}です。年齢は{player.年齢}歳で、身長は{player.身長}cm、体重は{player.体重}kgです。"
        except BaseballPlayer.DoesNotExist:
            response = "該当する選手が見つかりませんでした。"

        return response

    def post(self, request, *args, **kwargs):
        form = ChatForm(request.POST)
        if form.is_valid():
            user_input = form.cleaned_data['message']

            # データベースに保存
            conversation = BaseballPlayer(user_message=user_input)
            conversation.save()

            # ChatGPTの応答取得
            response = self.get_chatgpt_response(user_input)

            # データベースに応答を保存
            conversation.chatgpt_response = response
            conversation.save()

            return JsonResponse({'response': response})
        return JsonResponse({'response': 'Invalid message'})
