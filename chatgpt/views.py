import openai
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import csv
from io import TextIOWrapper

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

@csrf_exempt
def chat_view(request):
    return render(request, 'chatgpt/chatgpt.html')

@csrf_exempt
def chat_api(request):
    if request.method == 'POST':
        user_message = request.POST.get('user_message', '')

        # ユーザーからのテキストメッセージを取得
        if 'csv_file' in request.FILES:
            csv_file = request.FILES['csv_file']
            
            # CSVファイルからテキストデータを取得
            user_message += get_text_from_csv(csv_file)

        # OpenAI APIにユーザーのメッセージを送信
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=user_message,
            max_tokens=100
        )

        gpt_response = response.choices[0].text.strip()

        return JsonResponse({'gpt_response': gpt_response})

    return JsonResponse({'error': 'Invalid request method'})

def get_text_from_csv(csv_file):
    # CSVファイルからテキストデータを取得する関数
    text_data = ''
    decoded_file = TextIOWrapper(csv_file.file, encoding='utf-8')
    csv_reader = csv.reader(decoded_file)
    
    for row in csv_reader:
        text_data += ' '.join(row) + '\n'
    
    return text_data