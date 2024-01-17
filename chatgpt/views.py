# chatgpt/views.py

import openai
from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .forms import ChatForm
from django.conf import settings

from .models import GiantsHitter

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
    # データベースから選手データを取得して、ChatGPT に渡す
        player_data = self.get_player_data()
        prompt = f"User: {user_message}\nPlayers: {', '.join(player_data)}\n"

        try:
            response = openai.Completion.create(
                engine="gpt-3.5-turbo",  # GPT-3.5のエンジンIDに変更する
                prompt=prompt,
                max_tokens=150,
                n=1,
                stop=None,
                temperature=0.7
            )
            return response['choices'][0]['text'].strip()
        except openai.error.OpenAIError as e:
            # OpenAIのエラーを適切にハンドルします
            print(f"OpenAI API error: {e}")
            return "I'm sorry, there was an error processing your request."

    def get_player_data(self):
        # データベースから選手データを取得
        players = GiantsHitter.objects.order_by('-打率')[:5]  # 打率の高い順に取得（適切な条件に変更してください）
        player_data = [f"{player.選手名} ({player.打率})" for player in players]
        return player_data
