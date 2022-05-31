# Generated by Django 3.2.13 on 2022-05-30 09:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('charts', '0012_d3category_categories'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='d3category',
            name='categories',
        ),
        migrations.AddField(
            model_name='d3category',
            name='categories',
            field=models.ManyToManyField(related_name='_charts_d3category_categories_+', to='charts.D3Category'),
        ),
    ]