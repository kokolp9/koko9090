
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Trash2, Users } from 'lucide-react';

interface FawryItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface FawrySale {
  id: string;
  customerName: string;
  itemType: string;
  paymentStatus: string;
  amountPaid: number;
  remainingAmount: number;
  items: FawryItem[];
  total: number;
  date: string;
}

const FawrySalesRecord = () => {
  const [sales, setSales] = useState<FawrySale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<FawrySale | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const savedSales = localStorage.getItem('kairo_fawry_sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  };

  const deleteSale = (saleId: string) => {
    const updatedSales = sales.filter(sale => sale.id !== saleId);
    setSales(updatedSales);
    localStorage.setItem('kairo_fawry_sales', JSON.stringify(updatedSales));
    
    toast({
      title: "تم حذف المبيعة",
      description: "تم حذف مبيعة فوري بنجاح",
    });
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            سجل مبيعات فوري
          </CardTitle>
          <CardDescription>
            عرض جميع مبيعات فوري المسجلة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث باسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredSales.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">نوع الصنف</TableHead>
                    <TableHead className="text-right">حالة الدفع</TableHead>
                    <TableHead className="text-right">المبلغ المدفوع</TableHead>
                    <TableHead className="text-right">المبلغ المتبقي</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.customerName}</TableCell>
                      <TableCell>{sale.itemType}</TableCell>
                      <TableCell>{sale.paymentStatus}</TableCell>
                      <TableCell>{sale.amountPaid.toFixed(2)} جنيه</TableCell>
                      <TableCell>{sale.remainingAmount.toFixed(2)} جنيه</TableCell>
                      <TableCell>{sale.total.toFixed(2)} جنيه</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSale(sale)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>تفاصيل مبيعة فوري</DialogTitle>
                                <DialogDescription>
                                  عرض تفاصيل مبيعة فوري كاملة
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSale && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <strong>اسم العميل:</strong> {selectedSale.customerName}
                                    </div>
                                    <div>
                                      <strong>نوع الصنف:</strong> {selectedSale.itemType}
                                    </div>
                                    <div>
                                      <strong>حالة الدفع:</strong> {selectedSale.paymentStatus}
                                    </div>
                                    <div>
                                      <strong>التاريخ:</strong> {selectedSale.date}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">المنتجات:</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="text-right">اسم المنتج</TableHead>
                                          <TableHead className="text-right">الكمية</TableHead>
                                          <TableHead className="text-right">السعر</TableHead>
                                          <TableHead className="text-right">الإجمالي</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedSale.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                                            <TableCell>{item.total.toFixed(2)} جنيه</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                    <div>
                                      <strong>المبلغ المدفوع:</strong> {selectedSale.amountPaid.toFixed(2)} جنيه
                                    </div>
                                    <div>
                                      <strong>المبلغ المتبقي:</strong> {selectedSale.remainingAmount.toFixed(2)} جنيه
                                    </div>
                                    <div>
                                      <strong>الإجمالي:</strong> {selectedSale.total.toFixed(2)} جنيه
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSale(sale.id)}
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
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مبيعات فوري مسجلة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FawrySalesRecord;
