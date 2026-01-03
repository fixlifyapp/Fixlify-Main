import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpsellSettings, UpsellConfig as UpsellConfigType } from "@/hooks/useUpsellSettings";
import { Shield, FileText, Receipt, Info, Sparkles, DollarSign, Loader2, Settings, BarChart3, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpsellAnalytics } from "./UpsellAnalytics";
import { UpsellAIInsights } from "./UpsellAIInsights";

export function UpsellConfig() {
  const {
    config,
    isLoading,
    allWarrantyProducts,
    updateConfig,
    isUpdating
  } = useUpsellSettings();

  const [localConfig, setLocalConfig] = useState<UpsellConfigType>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local config with fetched config
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(localConfig) !== JSON.stringify(config));
  }, [localConfig, config]);

  const handleEstimateEnabledChange = (enabled: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      estimates: { ...prev.estimates, enabled }
    }));
  };

  const handleEstimateAutoSelectChange = (auto_select: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      estimates: { ...prev.estimates, auto_select }
    }));
  };

  const handleInvoiceEnabledChange = (enabled: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      invoices: { ...prev.invoices, enabled }
    }));
  };

  const handleInvoiceAutoSelectChange = (auto_select: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      invoices: { ...prev.invoices, auto_select }
    }));
  };

  const handleEstimateProductToggle = (productId: string, checked: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      estimates: {
        ...prev.estimates,
        products: checked
          ? [...prev.estimates.products, productId]
          : prev.estimates.products.filter(id => id !== productId)
      }
    }));
  };

  const handleInvoiceProductToggle = (productId: string, checked: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      invoices: {
        ...prev.invoices,
        products: checked
          ? [...prev.invoices.products, productId]
          : prev.invoices.products.filter(id => id !== productId)
      }
    }));
  };

  const handleSave = () => {
    updateConfig(localConfig);
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const estimateSelectedCount = localConfig.estimates.products.length;
  const invoiceSelectedCount = localConfig.invoices.products.length;

  return (
    <Tabs defaultValue="configuration" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-xl">
        <TabsTrigger value="configuration" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configuration
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="ai-insights" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="configuration">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Upsell Configuration
            </CardTitle>
            <CardDescription>
              Configure automatic upsell suggestions for estimates and invoices.
              Products will be pre-selected when technicians create new documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How Auto-Upsell Works</p>
              <p className="text-blue-700">
                When enabled, selected warranty products will be automatically pre-selected
                when technicians create new estimates or invoices. Technicians can still
                remove items they don't need for specific jobs.
              </p>
            </div>
          </div>

          {/* ESTIMATES SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold">Estimates</h3>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Sparkles className="h-3 w-3 mr-1" />
                Best for upsells
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="estimates-enabled" className="text-base font-medium">
                    Enable upsells on estimates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show warranty options in the estimate builder
                  </p>
                </div>
                <Switch
                  id="estimates-enabled"
                  checked={localConfig.estimates.enabled}
                  onCheckedChange={handleEstimateEnabledChange}
                />
              </div>

              {localConfig.estimates.enabled && (
                <>
                  <Separator />

                  {/* Auto-select toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="estimates-auto" className="text-base font-medium">
                        Auto-select products
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically pre-select chosen products when creating estimates
                      </p>
                    </div>
                    <Switch
                      id="estimates-auto"
                      checked={localConfig.estimates.auto_select}
                      onCheckedChange={handleEstimateAutoSelectChange}
                    />
                  </div>

                  {localConfig.estimates.auto_select && (
                    <>
                      <Separator />

                      {/* Product selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Products to auto-add ({estimateSelectedCount} selected)
                          </Label>
                        </div>

                        {allWarrantyProducts.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No warranty products found</p>
                            <p className="text-sm">Add products with category "Warranties" in Products settings</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {allWarrantyProducts.map((product) => (
                              <div
                                key={product.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                  localConfig.estimates.products.includes(product.id)
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id={`estimate-${product.id}`}
                                    checked={localConfig.estimates.products.includes(product.id)}
                                    onCheckedChange={(checked) =>
                                      handleEstimateProductToggle(product.id, checked === true)
                                    }
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`estimate-${product.id}`}
                                      className="font-medium cursor-pointer"
                                    >
                                      {product.name}
                                    </Label>
                                    {product.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                  <DollarSign className="h-3 w-3 mr-0.5" />
                                  {product.price.toFixed(2)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* INVOICES SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-violet-600" />
              <h3 className="text-lg font-semibold">Invoices</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="invoices-enabled" className="text-base font-medium">
                    Enable upsells on invoices
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show warranty options in the invoice builder
                  </p>
                </div>
                <Switch
                  id="invoices-enabled"
                  checked={localConfig.invoices.enabled}
                  onCheckedChange={handleInvoiceEnabledChange}
                />
              </div>

              {localConfig.invoices.enabled && (
                <>
                  <Separator />

                  {/* Auto-select toggle with warning */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="invoices-auto" className="text-base font-medium">
                        Auto-select products
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically pre-select chosen products when creating invoices
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        ℹ️ Recommended OFF - Invoice stage is typically for unexpected discoveries only
                      </p>
                    </div>
                    <Switch
                      id="invoices-auto"
                      checked={localConfig.invoices.auto_select}
                      onCheckedChange={handleInvoiceAutoSelectChange}
                    />
                  </div>

                  {localConfig.invoices.auto_select && (
                    <>
                      <Separator />

                      {/* Product selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Products to auto-add ({invoiceSelectedCount} selected)
                          </Label>
                        </div>

                        {allWarrantyProducts.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No warranty products found</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {allWarrantyProducts.map((product) => (
                              <div
                                key={product.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                  localConfig.invoices.products.includes(product.id)
                                    ? "border-violet-300 bg-violet-50"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id={`invoice-${product.id}`}
                                    checked={localConfig.invoices.products.includes(product.id)}
                                    onCheckedChange={(checked) =>
                                      handleInvoiceProductToggle(product.id, checked === true)
                                    }
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`invoice-${product.id}`}
                                      className="font-medium cursor-pointer"
                                    >
                                      {product.name}
                                    </Label>
                                    {product.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                  <DollarSign className="h-3 w-3 mr-0.5" />
                                  {product.price.toFixed(2)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Save/Reset buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasChanges && "You have unsaved changes"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isUpdating}
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <UpsellAnalytics />
      </TabsContent>

      <TabsContent value="ai-insights">
        <UpsellAIInsights />
      </TabsContent>
    </Tabs>
  );
}
