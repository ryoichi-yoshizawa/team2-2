# chatgpt/views.py

import openai
from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .forms import ChatForm
from django.conf import settings

from .models import CLeague

openai.api_key = settings.OPENAI_API_KEY

class ChatGPTView(View):
    template_name = 'chatgpt/chatgpt.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        user_message = request.POST.get('message', '')
        chatgpt_response = self.get_chatgpt_response(user_message)
        return JsonResponse({'response': chatgpt_response})

    def get_chatgpt_response(self, user_message):
    # ユーザーの要求を解析し、Djangoデータベースから選手データを取得
        if "セ・リーグの成績の良い順に" in user_message and "人表示してください" in user_message:
            try:
                # データベースから順位の高い順に選手データを取得
                players = CLeague.objects.order_by('順位')[:9]
                player_names = [player.選手名 for player in players]
            
                # ChatGPTの応答を生成
                response_text = f"セ・リーグの成績の良い順に9人表示します：{', '.join(player_names)}"
            except Exception as e:
                response_text = f"エラーが発生しました：{str(e)}"
        else:
            # デフォルトのChatGPTの応答
            response_text = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message},
                ]
            )['choices'][0]['message']['content']

        return response_text