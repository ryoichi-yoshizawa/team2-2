from django.db import models

# Create your models here.
# chatgpt/models.py

# models.py
# chatgpt/models.py

class GiantsHitter(models.Model):
    背番号 = models.TextField()
    選手名 = models.TextField()
    打率 = models.TextField()
    試合 = models.TextField()
    打席数 = models.TextField()
    打数 = models.TextField()
    安打 = models.TextField()
    本塁打 = models.TextField()
    打点 = models.TextField()
    盗塁 = models.TextField()
    四球 = models.TextField()
    死球 = models.TextField()
    三振 = models.TextField()
    犠打 = models.TextField()
    併殺打 = models.TextField()
    出塁率 = models.TextField()
    長打率 = models.TextField()
    OPS = models.TextField()
    RC27 = models.TextField()
    XR27 = models.TextField()

    def __str__(self):
        return self.選手名
    
class CLeague(models.Model):
    順位 = models.IntegerField()
    選手名 = models.TextField()
    チーム = models.TextField()
    打率 = models.DecimalField(max_digits=4, decimal_places=3)  # 0.000形式の小数
    試合 = models.IntegerField()
    打席数 = models.IntegerField()
    打数 = models.IntegerField()
    得点 = models.IntegerField()
    安打 = models.IntegerField()
    二塁打 = models.IntegerField()
    三塁打 = models.IntegerField()
    本塁打 = models.IntegerField()
    塁打 = models.IntegerField()
    打点 = models.IntegerField()
    盗塁 = models.IntegerField()
    盗塁刺 = models.IntegerField()
    犠打 = models.IntegerField()
    犠飛 = models.IntegerField()
    四球 = models.IntegerField()
    敬遠 = models.IntegerField()
    死球 = models.IntegerField()
    三振 = models.IntegerField()
    併殺打 = models.IntegerField()
    出塁率 = models.FloatField()  # FloatFieldも選択可能
    長打率 = models.FloatField()
    
class CLeague_ave(models.Model):
    順位 = models.IntegerField()
    選手名 = models.TextField()
    チーム = models.TextField()
    打率 = models.DecimalField(max_digits=4, decimal_places=3)  # 0.000形式の小数
    試合 = models.IntegerField()
    打席数 = models.IntegerField()
    打数 = models.IntegerField()
    得点 = models.IntegerField()
    安打 = models.IntegerField()
    二塁打 = models.IntegerField()
    三塁打 = models.IntegerField()
    本塁打 = models.IntegerField()
    塁打 = models.IntegerField()
    打点 = models.IntegerField()
    盗塁 = models.IntegerField()
    盗塁刺 = models.IntegerField()
    犠打 = models.IntegerField()
    犠飛 = models.IntegerField()
    四球 = models.IntegerField()
    敬遠 = models.IntegerField()
    死球 = models.IntegerField()
    三振 = models.IntegerField()
    併殺打 = models.IntegerField()
    出塁率 = models.FloatField()  # FloatFieldも選択可能
    長打率 = models.FloatField()