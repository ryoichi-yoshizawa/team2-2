import openai
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Config/settings.pyからAPIキーを取得
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY

@csrf_exempt  # CSRF保護を無効にする（開発用）
def chat(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input')
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=user_input,
            max_tokens=150
        )
        return JsonResponse({'response': response.choices[0].text.strip()})

    # GETリクエストの場合
    return render(request, 'chatgpt/chatgpt.html')