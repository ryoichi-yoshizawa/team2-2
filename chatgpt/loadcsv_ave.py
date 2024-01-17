import os
import sys
import pandas as pd

# プロジェクトのルートディレクトリを追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Djangoの設定をロード
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

# モデルをインポート
from chatgpt.models import CLeague_ave

# CSVファイルへのパス
csv_file = os.path.join(os.path.dirname(__file__), 'CLeague_ave.csv')

# CSVファイルを読み込む
data = pd.read_csv(csv_file)

# 各行のデータをDjangoモデルに保存する
for _, row in data.iterrows():
    CLeague_ave.objects.create(
        順位=row['順位'],
        選手名=row['選手名'],
        チーム=row['チーム'],
        打率=row['打率'],
        試合=row['試合'],
        打席数=row['打席数'],
        打数=row['打数'],
        得点=row['得点'],
        安打=row['安打'],
        二塁打=row['二塁打'],
        三塁打=row['三塁打'],
        本塁打=row['本塁打'],
        塁打=row['塁打'],
        打点=row['打点'],
        盗塁刺=row['盗塁刺'],
        犠打=row['犠打'],
        犠飛=row['犠飛'],
        四球=row['四球'],
        敬遠=row['敬遠'],
        死球=row['死球'],
        三振=row['三振'],
        併殺打=row['併殺打'],
        出塁率=row['出塁率'],
        長打率=row['長打率'],
    )
