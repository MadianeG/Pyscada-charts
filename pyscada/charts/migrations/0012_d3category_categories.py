# Generated by Django 3.2.13 on 2022-05-30 09:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('charts', '0011_auto_20220525_1057'),
    ]

    operations = [
        migrations.AddField(
            model_name='d3category',
            name='categories',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='charts.d3category'),
        ),
    ]
