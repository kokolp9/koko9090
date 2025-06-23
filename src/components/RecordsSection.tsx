
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, FilePlus, FileMinus, FileX, Users, Clock } from 'lucide-react';
import SalesRecord from './records/SalesRecord';
import InvoiceRecord from './records/InvoiceRecord';
import InvoiceArchive from './records/InvoiceArchive';
import SalesReturnRecord from './records/SalesReturnRecord';
import InvoiceReturnRecord from './records/InvoiceReturnRecord';
import FawrySalesRecord from './records/FawrySalesRecord';
import CreditRecord from './records/CreditRecord';

const RecordsSection = () => {
  const [activeRecord, setActiveRecord] = useState('');

  const recordSections = [
    { id: 'sales', title: 'سجل المبيعات', icon: Calendar, description: 'عرض جميع المبيعات المسجلة' },
    { id: 'invoices', title: 'سجل الفواتير', icon: FileText, description: 'عرض جميع الفواتير المصدرة' },
    { id: 'archive', title: 'أرشيف الفواتير', icon: FilePlus, description: 'عرض الفواتير المؤرشفة' },
    { id: 'sales-returns', title: 'سجل مرتجع المبيعات', icon: FileMinus, description: 'عرض مرتجعات المبيعات' },
    { id: 'invoice-returns', title: 'سجل مرتجع الفواتير', icon: FileX, description: 'عرض مرتجعات الفواتير' },
    { id: 'fawry-sales', title: 'سجل مبيعات فوري', icon: Users, description: 'عرض مبيعات فوري المسجلة' },
    { id: 'credit-sales', title: 'سجل المؤجل', icon: Clock, description: 'عرض المبيعات المؤجلة' },
  ];

  const renderContent = () => {
    switch (activeRecord) {
      case 'sales':
        return <SalesRecord />;
      case 'invoices':
        return <InvoiceRecord />;
      case 'archive':
        return <InvoiceArchive />;
      case 'sales-returns':
        return <SalesReturnRecord />;
      case 'invoice-returns':
        return <InvoiceReturnRecord />;
      case 'fawry-sales':
        return <FawrySalesRecord />;
      case 'credit-sales':
        return <CreditRecord />;
      default:
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-primary mb-4">
              السجلات والتقارير
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              اختر القسم المراد عرضه
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {recordSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card 
                    key={section.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveRecord(section.id)}
                  >
                    <CardHeader className="text-center">
                      <Icon className="w-12 h-12 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {activeRecord && (
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveRecord('')}
          >
            العودة للسجلات
          </Button>
          <h2 className="text-xl font-semibold">
            {recordSections.find(section => section.id === activeRecord)?.title}
          </h2>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default RecordsSection;
