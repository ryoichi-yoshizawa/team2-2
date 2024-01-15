from django.db import models

# Create your models here.
# chatgpt/models.py

# models.py
from django.db import models

class BaseballPlayer(models.Model):
    選手名 = models.TextField()
    守備 = models.TextField()
    生年月日 = models.TextField()
    年齢 = models.IntegerField()
    年数 = models.IntegerField()
    身長 = models.IntegerField()
    体重 = models.IntegerField()
    血液型 = models.TextField()
    投打 = models.TextField()
    出身地 = models.TextField()
    年俸 = models.IntegerField()