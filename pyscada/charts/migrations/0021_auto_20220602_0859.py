# Generated by Django 3.2.13 on 2022-06-02 08:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pyscada', '0098_alter_device_polling_interval'),
        ('charts', '0020_auto_20220602_0756'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apexchart',
            name='type',
            field=models.PositiveSmallIntegerField(choices=[(0, 'Bar'), (1, 'Line')], default=0),
        ),
        migrations.CreateModel(
            name='ApexMixedChart',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(default='', max_length=400)),
                ('variables', models.ManyToManyField(blank=True, to='pyscada.Variable')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='apexchartaxis',
            name='chart',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='charts.apexmixedchart'),
        ),
    ]