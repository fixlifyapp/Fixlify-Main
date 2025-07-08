import { useState, useEffect } from 'react';
import { Code, Plus, Trash, Edit, Key, RefreshCw, Play, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { EdgeFunctionService, EdgeFunction, EdgeFunctionSecret } from '@/services/edge-function-service';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function EdgeFunctionsPage() {
  const [functions, setFunctions] = useState<EdgeFunction[]>([]);
  const [secrets, setSecrets] = useState<EdgeFunctionSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const [secretsLoading, setSecretsLoading] = useState(false);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<EdgeFunction | null>(null);
  const [functionCode, setFunctionCode] = useState('');
  const [secretName, setSecretName] = useState('');
  const [secretValue, setSecretValue] = useState('');

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    try {
      setLoading(true);
      const data = await EdgeFunctionService.listFunctions();
      setFunctions(data);
    } catch (error) {
      console.error('Failed to load functions:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadSecrets = async () => {
    try {
      setSecretsLoading(true);
      const data = await EdgeFunctionService.listSecrets();
      setSecrets(data);
    } catch (error) {
      console.error('Failed to load secrets:', error);
    } finally {
      setSecretsLoading(false);
    }
  };

  const handleDelete = async (functionName: string) => {
    if (!confirm(`Are you sure you want to delete ${functionName}?`)) return;
    
    try {
      await EdgeFunctionService.deleteFunction(functionName);
      loadFunctions();
    } catch (error) {
      console.error('Failed to delete function:', error);
    }
  };

  const handleEdit = (func: EdgeFunction) => {
    setSelectedFunction(func);
    setFunctionCode('// Function code would be loaded here');
    setEditDialogOpen(true);
  };

  const handleUpdateFunction = async () => {
    if (!selectedFunction) return;
    
    try {
      await EdgeFunctionService.updateFunction(selectedFunction.name, functionCode);
      setEditDialogOpen(false);
      loadFunctions();
    } catch (error) {
      console.error('Failed to update function:', error);
    }
  };

  const handleSetSecret = async () => {
    if (!secretName || !secretValue) {
      toast.error('Please enter both name and value');
      return;
    }
    
    try {
      await EdgeFunctionService.setSecret(secretName, secretValue);
      setSecretDialogOpen(false);
      setSecretName('');
      setSecretValue('');
      loadSecrets();
    } catch (error) {
      console.error('Failed to set secret:', error);
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!confirm(`Are you sure you want to delete secret ${name}?`)) return;
    
    try {
      await EdgeFunctionService.deleteSecret(name);
      loadSecrets();
    } catch (error) {
      console.error('Failed to delete secret:', error);
    }
  };
  return (
    <PageLayout>
      <PageHeader
        title="Edge Functions"
        description="Manage your Supabase Edge Functions and secrets"
        icon={Code}
        actions={
          <Button onClick={() => toast.info('Use Supabase CLI to deploy new functions')}>
            <Plus className="h-4 w-4 mr-2" />
            Deploy Function
          </Button>
        }
      />

      <Tabs defaultValue="functions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="functions">
            <Code className="h-4 w-4 mr-2" />
            Functions
          </TabsTrigger>
          <TabsTrigger value="secrets" onClick={() => loadSecrets()}>
            <Key className="h-4 w-4 mr-2" />
            Secrets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="functions">
          <Card>
            <CardHeader>
              <CardTitle>Edge Functions</CardTitle>
              <CardDescription>
                Manage your deployed edge functions. Use the Supabase CLI for deployments.
              </CardDescription>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={loadFunctions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Function Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {functions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No edge functions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      functions.map((func) => (
                        <TableRow key={func.name}>
                          <TableCell className="font-medium font-mono">{func.name}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {func.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(func)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toast.info(`View logs for ${func.name} in Supabase dashboard`)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDelete(func.name)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="secrets">
          <Card>
            <CardHeader>
              <CardTitle>Environment Secrets</CardTitle>
              <CardDescription>
                Manage environment variables and API keys for your edge functions
              </CardDescription>
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={() => setSecretDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Secret
                </Button>
                <Button size="sm" variant="outline" onClick={loadSecrets}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {secretsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Secret Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {secrets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No secrets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      secrets.map((secret) => (
                        <TableRow key={secret.name}>
                          <TableCell className="font-medium font-mono">{secret.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {secret.created_at ? new Date(secret.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSecretName(secret.name);
                                setSecretDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteSecret(secret.name)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Edit Function Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit {selectedFunction?.name}</DialogTitle>
            <DialogDescription>
              Note: Direct editing is not available. Use the Supabase CLI to update functions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Function Code</Label>
              <Textarea
                value={functionCode}
                onChange={(e) => setFunctionCode(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Function code..."
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                To update this function, save the code and run:
              </p>
              <code className="text-sm font-mono block mt-2">
                supabase functions deploy {selectedFunction?.name}
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleUpdateFunction}>
              Copy Update Command
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret Dialog */}
      <Dialog open={secretDialogOpen} onOpenChange={setSecretDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{secretName ? 'Update' : 'Add'} Secret</DialogTitle>
            <DialogDescription>
              Set environment variables for your edge functions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secret-name" className="text-right">
                Name
              </Label>
              <Input
                id="secret-name"
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                className="col-span-3"
                placeholder="API_KEY"
                disabled={!!secretName}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secret-value" className="text-right">
                Value
              </Label>
              <Input
                id="secret-value"
                type="password"
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                className="col-span-3"
                placeholder="••••••••"
              />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Run this command to set the secret:
              </p>
              <code className="text-sm font-mono block mt-2">
                supabase secrets set {secretName || 'SECRET_NAME'}=&lt;value&gt;
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSecretDialogOpen(false);
              setSecretName('');
              setSecretValue('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleSetSecret}>
              Save Instructions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}