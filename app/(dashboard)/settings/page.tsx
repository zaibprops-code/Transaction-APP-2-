import { Metadata } from "next";
import { Settings, User, Building2, Key, Bell, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-base font-semibold text-foreground">Settings</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <Input defaultValue="Sarah Mitchell" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input defaultValue="Lead Transaction Coordinator" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input defaultValue="sarah@closetrack.co" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <Input defaultValue="(555) 234-5678" type="tel" />
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Organization Name</label>
                <Input defaultValue="Mitchell TC Group" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                <Input defaultValue="mitchell-tc" />
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Current Plan</p>
                  <p className="text-xs text-muted-foreground">Growth — $149/month</p>
                </div>
                <Badge variant="default">Growth</Badge>
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Deal stage changes", desc: "Get notified when a deal moves to a new stage" },
                { label: "Task due reminders", desc: "Reminders 24h and 1h before task deadlines" },
                { label: "Signature completed", desc: "When a signer completes their signature" },
                { label: "AI risk alerts", desc: "When AI detects deal risks" },
                { label: "Document uploaded", desc: "When team members upload documents" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Growth Plan</h3>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">$149/month · Next billing: Dec 15, 2024</p>
              </div>
              <Button variant="outline">Manage subscription</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                API Keys & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">API Key</label>
                <div className="flex gap-2">
                  <Input defaultValue="sk_live_••••••••••••••••••••••••••••••" type="password" className="font-mono" />
                  <Button variant="outline" size="sm">Reveal</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
