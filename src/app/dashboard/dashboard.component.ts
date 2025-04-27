import { Component, OnInit } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalVariable } from '../global/global';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule, NgFor, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts: () => import('echarts'), // Lazy-load ECharts
      },
    },
  ],
})
export class DashboardComponent implements OnInit {
  xAxisOptions = ['Jours', 'Semaines', 'Mois'];
  selectedScale = 'Jours';
  yAxisOptions= ['N° Ventes', 'Chiffre de Ventes']
  selectedType = 'N° Ventes';

  // Define sales data for different time scales
  salesData: any = {
    Jours: { x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], y: [50, 75, 100, 90, 120, 150, 130] },
    Semaines: { x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], y: [200, 300, 250, 400] },
    Mois: { x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: [1200, 1500, 1300, 1600, 1800] },
  };

  salesAmountData: any = {
    Jours: { x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], y: [5000, 7500, 1000, 900, 1200, 1500, 1300] },
    Semaines: { x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], y: [20000, 30000, 25000, 40000] },
    Mois: { x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: [100000, 1500000, 130000, 160000, 180000] },
  };

    
  sales: any ={
    'N° Ventes': this.salesData,
    'Chiffre de Ventes': this.salesAmountData
  }

  chartOptions: any = {};

  constructor(private http: HttpClient,  private toast: ToastrService
    , private spinner: NgxSpinnerService) {
    this.updateChartData();
    //console.log(this.formatDate("2025-03-09"));
  }


  ngOnInit(): void {
    
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
    this.spinner.show();
    this.http.get<any>(GlobalVariable.BASE_API_URL+"item/getDashboardStats")
    .subscribe(data => {
      this.spinner.hide();
      //console.log(data);
    });
         
  }


  updateChartData() {
    const data = this.sales[this.selectedType][this.selectedScale];
  
    this.chartOptions = {
      grid: { left: '15%', right: '5%', top: '10%', bottom: '10%' },
      xAxis: { type: 'category', data: data.x },
      yAxis: { 
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {if(this.selectedType=='Chiffre de Ventes')  return`${this.format(value)}`; else return value; } // Add dollar sign ($) before each value
        }
      },
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any) => {
          let tooltipText = `${params[0].axisValue}: <br/>`;
          params.forEach((param: any) => {
            if(this.selectedType=='Chiffre de Ventes') 
              tooltipText += `${param.seriesName}: ${this.format(param.value)} <br/>`;
            else 
              tooltipText += `${param.seriesName}: ${param.value} <br/>`;
          });
          return tooltipText;
        }
      },
      series: [{ 
        name: 'Ventes',
        data: data.y, 
        type: 'line', 
        smooth: true 
      }],
    };
  
    setTimeout(() => {
      window.dispatchEvent(new Event('resize')); // Ensures chart resizes correctly
    }, 100);
  }
  

  format(value: number): string {
    if (value == null) return '';

    // Ensure the value is a number
    value = Number(value);

    // Format the number with a comma as the thousands separator and a dot as the decimal separator
    const formattedValue = value
      .toFixed(2) // Ensure two decimal places
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') // Add comma as thousands separator
      .replace(/,(\d{2})$/, '.$1'); // Replace last comma before decimal with a dot

    return `${formattedValue} XAF`;
  }

  formatDate(dateString:string) {
    const options: any = { year: 'numeric', month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options).toUpperCase();
}


}
