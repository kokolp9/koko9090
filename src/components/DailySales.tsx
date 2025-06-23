
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ShoppingCart, Printer } from 'lucide-react';

interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
}

const DailySales = () => {
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'pending'>('paid');
  const [paidAmount, setPaidAmount] = useState('');
  const [currentSaleItems, setCurrentSaleItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('kairo_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleAddItem = () => {
    if (!productName || !quantity || !price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const requestedQuantity = parseInt(quantity);
    const itemPrice = parseFloat(price);

    const newItem: SaleItem = {
      id: Date.now().toString(),
      productName,
      quantity: requestedQuantity,
      price: itemPrice,
      total: requestedQuantity * itemPrice
    };

    setCurrentSaleItems([...currentSaleItems, newItem]);
    setProductName('');
    setQuantity('');
    setPrice('');
    
    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج إلى المبيعات",
    });
  };

  const handleRemoveItem = (id: string) => {
    setCurrentSaleItems(currentSaleItems.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSale = () => {
    if (!customerName || currentSaleItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل وإضافة منتجات",
        variant: "destructive",
      });
      return;
    }

    const total = currentSaleItems.reduce((sum, item) => sum + item.total, 0);
    let finalPaidAmount = 0;
    let remainingAmount = total;

    if (paymentStatus === 'paid') {
      finalPaidAmount = total;
      remainingAmount = 0;
    } else if (paymentStatus === 'partial' && paidAmount) {
      finalPaidAmount = parseFloat(paidAmount);
      remainingAmount = total - finalPaidAmount;
      if (finalPaidAmount >= total) {
        finalPaidAmount = total;
        remainingAmount = 0;
      }
    }

    const newSale = {
      id: Date.now().toString(),
      customerName,
      items: currentSaleItems,
      total,
      paymentStatus,
      paidAmount: finalPaidAmount,
      remainingAmount,
      date: new Date().toLocaleDateString('ar-EG')
    };

    // Update inventory - deduct quantities
    const updatedProducts = products.map(product => {
      const saleItem = currentSaleItems.find(item => item.productName === product.name);
      if (saleItem) {
        return {
          ...product,
          quantity: Math.max(0, product.quantity - saleItem.quantity)
        };
      }
      return product;
    });

    // Save sale
    const savedSales = localStorage.getItem('kairo_sales');
    const sales = savedSales ? JSON.parse(savedSales) : [];
    sales.push(newSale);
    localStorage.setItem('kairo_sales', JSON.stringify(sales));

    // Save updated products
    localStorage.setItem('kairo_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Reset form
    setCustomerName('');
    setCurrentSaleItems([]);
    setPaymentStatus('paid');
    setPaidAmount('');
    
    toast({
      title: "تم حفظ المبيعة",
      description: "تم تسجيل المبيعة وتحديث المخزون بنجاح",
    });
  };

  const totalAmount = currentSaleItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              المبيعات اليومية
            </div>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </CardTitle>
          <CardDescription>
            تسجيل المبيعات اليومية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">اسم العميل</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product">اسم المنتج</Label>
                <Input
                  id="product"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="أدخل اسم المنتج"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="الكمية"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="السعر"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-status">حالة الدفع</Label>
                <Select value={paymentStatus} onValueChange={(value: 'paid' | 'partial' | 'pending') => setPaymentStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">تم الدفع</SelectItem>
                    <SelectItem value="partial">دفع جزئي</SelectItem>
                    <SelectItem value="pending">مؤجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج
                </Button>
              </div>
            </div>

            {paymentStatus === 'partial' && (
              <div className="grid gap-2">
                <Label htmlFor="paid-amount">المبلغ المدفوع</Label>
                <Input
                  id="paid-amount"
                  type="number"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="أدخل المبلغ المدفوع"
                />
              </div>
            )}
          </div>

          {currentSaleItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">منتجات المبيعة</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSaleItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                        <TableCell>{item.total.toFixed(2)} جنيه</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    الإجمالي: {totalAmount.toFixed(2)} جنيه
                  </div>
                  {paymentStatus === 'partial' && paidAmount && (
                    <>
                      <div className="text-sm">
                        المبلغ المدفوع: {parseFloat(paidAmount).toFixed(2)} جنيه
                      </div>
                      <div className="text-sm text-red-600">
                        المبلغ المتبقي: {(totalAmount - parseFloat(paidAmount)).toFixed(2)} جنيه
                      </div>
                    </>
                  )}
                  {paymentStatus === 'pending' && (
                    <div className="text-sm text-red-600">
                      المبلغ المؤجل: {totalAmount.toFixed(2)} جنيه
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveSale} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  حفظ المبيعة
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySales;
