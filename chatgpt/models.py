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
