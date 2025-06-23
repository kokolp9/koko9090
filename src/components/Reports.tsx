import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Calendar } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);

  const reportTypes = [
    { value: 'sales', label: 'تقرير المبيعات' },
    { value: 'invoices', label: 'تقرير الفواتير' },
    { value: 'inventory', label: 'تقرير المخزون' },
    { value: 'returns', label: 'تقرير المرتجعات' },
    { value: 'fawry', label: 'تقرير مبيعات فوري' },
  ];

  const reportPeriods = [
    { value: 'daily', label: 'يومي' },
    { value: 'monthly', label: 'شهري' },
    { value: 'custom', label: 'تاريخ مخصص' },
  ];

  const generateReport = () => {
    if (!reportType || !reportPeriod) return;

    const today = new Date().toLocaleDateString('ar-EG');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let data: any[] = [];

    switch (reportType) {
      case 'sales':
        const sales = JSON.parse(localStorage.getItem('kairo_sales') || '[]');
        data = filterDataByPeriod(sales, reportPeriod, customDate, today, currentMonth, currentYear);
        break;
      case 'invoices':
        const invoices = JSON.parse(localStorage.getItem('kairo_invoices') || '[]');
        data = filterDataByPeriod(invoices, reportPeriod, customDate, today, currentMonth, currentYear);
        break;
      case 'inventory':
        data = JSON.parse(localStorage.getItem('kairo_products') || '[]');
        break;
      case 'returns':
        const salesReturns = JSON.parse(localStorage.getItem('kairo_sales_returns') || '[]');
        const invoiceReturns = JSON.parse(localStorage.getItem('kairo_invoice_returns') || '[]');
        data = [...salesReturns, ...invoiceReturns];
        data = filterDataByPeriod(data, reportPeriod, customDate, today, currentMonth, currentYear);
        break;
      case 'fawry':
        const fawrySales = JSON.parse(localStorage.getItem('kairo_fawry_sales') || '[]');
        data = filterDataByPeriod(fawrySales, reportPeriod, customDate, today, currentMonth, currentYear);
        break;
    }

    setReportData(data);
  };

  const filterDataByPeriod = (data: any[], period: string, customDate: string, today: string, currentMonth: number, currentYear: number) => {
    if (period === 'daily') {
      return data.filter((item: any) => item.date === today);
    } else if (period === 'monthly') {
      return data.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
    } else if (period === 'custom' && customDate) {
      const targetDate = new Date(customDate).toLocaleDateString('ar-EG');
      return data.filter((item: any) => item.date === targetDate);
    }
    return data;
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = generatePrintContent();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = () => {
    const reportTypeLabel = reportTypes.find(type => type.value === reportType)?.label;
    const reportPeriodLabel = reportPeriods.find(period => period.value === reportPeriod)?.label;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>تقرير - مؤسسة كيرو للأدوات الصحية</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; }
          .report-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">مؤسسة كيرو للأدوات الصحية</div>
        </div>
        <div class="report-info">
          <p><strong>نوع التقرير:</strong> ${reportTypeLabel}</p>
          <p><strong>فترة التقرير:</strong> ${reportPeriodLabel}</p>
          <p><strong>تاريخ الإنشاء:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${reportType === 'inventory' ? 
                '<th>اسم المنتج</th><th>الكمية</th><th>السعر</th><th>التاريخ</th>' :
                '<th>اسم العميل</th><th>عدد المنتجات</th><th>الإجمالي</th><th>التاريخ</th>'
              }
            </tr>
          </thead>
          <tbody>
            ${reportData.map(item => `
              <tr>
                ${reportType === 'inventory' ? 
                  `<td>${item.name}</td><td>${item.quantity}</td><td>${item.price.toFixed(2)} جنيه</td><td>${item.date}</td>` :
                  `<td>${item.customerName}</td><td>${item.items ? item.items.length : 0}</td><td>${item.total ? item.total.toFixed(2) : 0} جنيه</td><td>${item.date}</td>`
                }
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${reportType !== 'inventory' ? `
          <div class="total">
            <p>الإجمالي الكلي: ${reportData.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)} جنيه</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            التقارير
          </CardTitle>
          <CardDescription>
            إنشاء تقارير يومية وشهرية تفصيلية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-sm font-medium">فترة التقرير</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فترة التقرير" />
                </SelectTrigger>
                <SelectContent>
                  {reportPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportPeriod === 'custom' && (
              <div className="grid gap-2">
                <Label className="text-sm font-medium">التاريخ المخصص</Label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <Button onClick={generateReport} className="flex-1">
                <Calendar className="w-4 h-4 ml-2" />
                إنشاء التقرير
              </Button>
              {reportData.length > 0 && (
                <Button onClick={printReport} variant="outline">
                  <Printer className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {reportData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {reportTypes.find(type => type.value === reportType)?.label} - 
                {reportPeriods.find(period => period.value === reportPeriod)?.label}
              </h3>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {reportType === 'inventory' ? (
                        <>
                          <TableHead className="text-right">اسم المنتج</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">السعر</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-right">اسم العميل</TableHead>
                          <TableHead className="text-right">عدد المنتجات</TableHead>
                          <TableHead className="text-right">الإجمالي</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={index}>
                        {reportType === 'inventory' ? (
                          <>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                            <TableCell>{item.date}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium">{item.customerName}</TableCell>
                            <TableCell>{item.items ? item.items.length : 0}</TableCell>
                            <TableCell>{item.total ? item.total.toFixed(2) : 0} جنيه</TableCell>
                            <TableCell>{item.date}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {reportType !== 'inventory' && (
                <div className="text-lg font-semibold text-left">
                  الإجمالي الكلي: {reportData.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)} جنيه
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
