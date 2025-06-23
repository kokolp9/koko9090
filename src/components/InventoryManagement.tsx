import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
}

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: ''
  });
  const { toast } = useToast();

  // Load products from localStorage on component mount
  useEffect(() => {
    const loadProducts = () => {
      try {
        const savedProducts = localStorage.getItem('kairo_products');
        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts);
          console.log('Loading products from localStorage:', parsedProducts);
          setProducts(parsedProducts);
        }
      } catch (error) {
        console.error('Error loading products from localStorage:', error);
      }
    };
    
    loadProducts();
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    if (products.length >= 0) {
      try {
        console.log('Saving products to localStorage:', products);
        localStorage.setItem('kairo_products', JSON.stringify(products));
      } catch (error) {
        console.error('Error saving products to localStorage:', error);
      }
    }
  }, [products]);

  const handleAddProduct = () => {
    if (!formData.name || !formData.quantity || !formData.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      date: new Date().toLocaleDateString('ar-EG')
    };

    console.log('Adding new product:', newProduct);
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts, newProduct];
      console.log('Updated products list:', updatedProducts);
      return updatedProducts;
    });
    
    setFormData({ name: '', quantity: '', price: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج بنجاح إلى المخزون",
    });
  };

  const handleEditProduct = () => {
    if (!currentProduct || !formData.name || !formData.quantity || !formData.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product =>
        product.id === currentProduct.id
          ? {
              ...product,
              name: formData.name,
              quantity: parseInt(formData.quantity),
              price: parseFloat(formData.price)
            }
          : product
      );
      console.log('Updated products after edit:', updatedProducts);
      return updatedProducts;
    });

    setIsEditDialogOpen(false);
    setCurrentProduct(null);
    setFormData({ name: '', quantity: '', price: '' });
    
    toast({
      title: "تم تحديث المنتج",
      description: "تم تحديث بيانات المنتج بنجاح",
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(product => product.id !== id);
      console.log('Updated products after delete:', updatedProducts);
      return updatedProducts;
    });
    
    toast({
      title: "تم حذف المنتج",
      description: "تم حذف المنتج من المخزون",
    });
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity.toString(),
      price: product.price.toString()
    });
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Current products state:', products);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إدارة المخزون
          </CardTitle>
          <CardDescription>
            إدارة المنتجات والكميات والأسعار - المنتجات المحفوظة: {products.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة منتج جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات المنتج الجديد
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">اسم المنتج</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="أدخل الكمية"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">السعر</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="أدخل السعر"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleAddProduct}>إضافة</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل المنتج</DialogTitle>
                <DialogDescription>
                  تعديل بيانات المنتج
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">اسم المنتج</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم المنتج"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">الكمية</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="أدخل الكمية"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">السعر</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="أدخل السعر"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleEditProduct}>حفظ التغييرات</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المنتج</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">تاريخ الإضافة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.price.toFixed(2)} جنيه</TableCell>
                      <TableCell>{product.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      لا توجد منتجات في المخزون
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
