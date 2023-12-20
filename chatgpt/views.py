# chatgpt/views.py

import openai
from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .forms import ChatForm
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY

class ChatGPTView(View):
    template_name = 'chatgpt/chatgpt.html'

    def get(self, request, *args, **kwargs):
        form = ChatForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = ChatForm(request.POST)
        if form.is_valid():
            user_input = form.cleaned_data['message']
            response = self.get_chatgpt_response(user_input)
            return JsonResponse({'response': response})
        return JsonResponse({'response': 'Invalid message'})

    def get_chatgpt_response(self, user_input):
        # ChatGPTへのリクエストを送信し、レスポンスを取得するロジックを記述
        response = openai.Completion.create(
            engine="text-davinci-003",  # ChatGPTを使用する場合は適切なエンジンを指定
            prompt=user_input,
            max_tokens=150
        )
        return response.choices[0].text.strip()
