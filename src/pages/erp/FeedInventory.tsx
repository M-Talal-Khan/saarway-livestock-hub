import { Lock, Wheat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FeedInventory = () => (
  <div className="max-w-2xl mx-auto text-center py-16">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
      <Lock className="h-8 w-8 text-muted-foreground" />
    </div>
    <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
    <h1 className="text-2xl font-bold text-foreground mb-3">Feed & Inventory</h1>
    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
      Track feed types, stock levels, and daily consumption at the station level. Manage feed inventory, set low-stock alerts, and view feed cost reports.
    </p>
    <Card className="max-w-sm mx-auto">
      <CardContent className="p-6 space-y-3 text-left">
        {[
          'Feed item management (rice husk, silage, concentrate, etc.)',
          'Station-level stock in/out tracking',
          'Low stock alerts',
          'Feed cost allocation per animal',
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Wheat className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{f}</span>
          </div>
        ))}
      </CardContent>
    </Card>
    <p className="text-xs text-muted-foreground mt-6">This module is planned for a future release.</p>
  </div>
);

export default FeedInventory;
