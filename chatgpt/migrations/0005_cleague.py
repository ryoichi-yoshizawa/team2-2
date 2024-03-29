# Generated by Django 4.2.7 on 2024-01-16 11:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatgpt', '0004_giantshitter_delete_baseballplayer'),
    ]

    operations = [
        migrations.CreateModel(
            name='CLeague',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('順位', models.TextField()),
                ('選手名', models.TextField()),
                ('チーム', models.TextField()),
                ('打率', models.TextField()),
                ('試合', models.TextField()),
                ('打席数', models.TextField()),
                ('打数', models.TextField()),
                ('得点', models.TextField()),
                ('安打', models.TextField()),
                ('二塁打', models.TextField()),
                ('三塁打', models.TextField()),
                ('本塁打', models.TextField()),
                ('塁打', models.TextField()),
                ('打点', models.TextField()),
                ('盗塁', models.TextField()),
                ('盗塁刺', models.TextField()),
                ('犠打', models.TextField()),
                ('犠飛', models.TextField()),
                ('四球', models.TextField()),
                ('敬遠', models.TextField()),
                ('死球', models.TextField()),
                ('三振', models.TextField()),
                ('併殺打', models.TextField()),
                ('出塁率', models.TextField()),
                ('長打率', models.TextField()),
            ],
        ),
    ]
