
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Trash2 } from 'lucide-react';

interface Sale {
  id: string;
  customerName: string;
  items: any[];
  total: number;
  date: string;
}

const SalesRecord = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedSales = localStorage.getItem('kairo_sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }

    const savedProducts = localStorage.getItem('kairo_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find(sale => sale.id === saleId);
    if (!saleToDelete) return;

    // Return products to inventory
    const updatedProducts = [...products];
    saleToDelete.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.name === item.productName);
      if (productIndex !== -1) {
        updatedProducts[productIndex].quantity += item.quantity;
      }
    });

    // Update sales list
    const updatedSales = sales.filter(sale => sale.id !== saleId);
    setSales(updatedSales);
    
    // Save to localStorage
    localStorage.setItem('kairo_sales', JSON.stringify(updatedSales));
    localStorage.setItem('kairo_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    toast({
      title: "تم حذف المبيعات",
      description: "تم حذف المبيعات وإرجاع المنتجات للمخزون",
    });
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>سجل المبيعات</CardTitle>
          <CardDescription>
            عرض وإدارة جميع المبيعات المسجلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث باسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">عدد المنتجات</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell>{sale.items.length}</TableCell>
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
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل المبيعات</DialogTitle>
                              <DialogDescription>
                                عرض تفاصيل المبيعات للعميل: {selectedSale?.customerName}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSale && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <strong>اسم العميل:</strong> {selectedSale.customerName}
                                  </div>
                                  <div>
                                    <strong>التاريخ:</strong> {selectedSale.date}
                                  </div>
                                </div>
                                <div>
                                  <strong>المنتجات:</strong>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-right">المنتج</TableHead>
                                        <TableHead className="text-right">الكمية</TableHead>
                                        <TableHead className="text-right">السعر</TableHead>
                                        <TableHead className="text-right">الإجمالي</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedSale.items.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.productName}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                                          <TableCell>{item.total.toFixed(2)} جنيه</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className="text-lg font-semibold">
                                  الإجمالي الكلي: {selectedSale.total.toFixed(2)} جنيه
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRecord;
