
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Clock, Search, Trash2, Eye } from 'lucide-react';

interface CreditItem {
  id: string;
  productName: string;
  quantity: number;
  amountPaid: number;
  remainingAmount: number;
}

interface CreditSale {
  id: string;
  customerName: string;
  items: CreditItem[];
  totalPaid: number;
  totalRemaining: number;
  date: string;
}

const CreditRecord = () => {
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<CreditSale | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCreditSales();
  }, []);

  const loadCreditSales = () => {
    const savedCreditSales = localStorage.getItem('kairo_credit_sales');
    if (savedCreditSales) {
      setCreditSales(JSON.parse(savedCreditSales));
    }
  };

  const handleDelete = (id: string) => {
    const updatedSales = creditSales.filter(sale => sale.id !== id);
    setCreditSales(updatedSales);
    localStorage.setItem('kairo_credit_sales', JSON.stringify(updatedSales));
    
    toast({
      title: "تم الحذف",
      description: "تم حذف المبيعة المؤجلة بنجاح",
    });
  };

  const filteredSales = creditSales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTotalPaid = () => creditSales.reduce((sum, sale) => sum + sale.totalPaid, 0);
  const getTotalRemaining = () => creditSales.reduce((sum, sale) => sum + sale.totalRemaining, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            سجل المؤجل
          </CardTitle>
          <CardDescription>
            عرض وإدارة جميع المبيعات المؤجلة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالعميل أو المنتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">إجمالي المدفوع</p>
                  <p className="text-2xl font-bold text-green-600">{getTotalPaid().toFixed(2)} جنيه</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">إجمالي الباقي</p>
                  <p className="text-2xl font-bold text-red-600">{getTotalRemaining().toFixed(2)} جنيه</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">عدد المبيعات</p>
                  <p className="text-2xl font-bold text-blue-600">{creditSales.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredSales.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">عدد المنتجات</TableHead>
                    <TableHead className="text-right">المبلغ المدفوع</TableHead>
                    <TableHead className="text-right">المبلغ الباقي</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.customerName}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.items.length}</TableCell>
                      <TableCell className="text-green-600">{sale.totalPaid.toFixed(2)} جنيه</TableCell>
                      <TableCell className="text-red-600">{sale.totalRemaining.toFixed(2)} جنيه</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSale(sale)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">لا توجد مبيعات مؤجلة</p>
            </div>
          )}

          {selectedSale && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>تفاصيل المبيعة - {selectedSale.customerName}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSale(null)}
                  className="w-fit"
                >
                  إغلاق
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">المبلغ المدفوع</TableHead>
                      <TableHead className="text-right">المبلغ الباقي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-green-600">{item.amountPaid.toFixed(2)} جنيه</TableCell>
                        <TableCell className="text-red-600">{item.remainingAmount.toFixed(2)} جنيه</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditRecord;
