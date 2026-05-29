"use client";

import { Settings, User, Building2, Key, Bell, Shield, CreditCard, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSettings } from "@/components/settings/appearance-settings";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-base font-semibold text-foreground">Settings</h1>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList className="mb-6 flex-wrap h-auto gap-y-1">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="portal">Client Portal</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

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

        <TabsContent value="portal">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Portal Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center shadow flex-shrink-0">
                      <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                        <line x1="2" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4"/>
                        <line x1="2" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7"/>
                        <line x1="2" y1="12.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        <circle cx="15.8" cy="12.5" r="1.7" fill="white"/>
                      </svg>
                    </div>
                    <div className="space-y-1.5">
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">Upload Logo</Button>
                      <p className="text-[11px] text-muted-foreground">PNG or SVG · max 1MB · shown in client portal header</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Brand Color</label>
                  <div className="flex items-center gap-3">
                    {[
                      { label: "CloseTrack Default", from: "from-indigo-500", to: "to-teal-600", active: true },
                      { label: "Ocean Blue", from: "from-blue-500", to: "to-cyan-500", active: false },
                      { label: "Warm Professional", from: "from-amber-500", to: "to-orange-500", active: false },
                    ].map((swatch) => (
                      <button
                        key={swatch.label}
                        title={swatch.label}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${swatch.from} ${swatch.to} ring-2 ring-offset-2 ring-offset-background transition-all ${swatch.active ? "ring-indigo-400" : "ring-transparent hover:ring-border"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">CloseTrack Default</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  Client Messaging
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Welcome Message Template</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                    rows={3}
                    defaultValue="Welcome! I've set up your portal so you can track every step of your transaction in one place. Feel free to reach out anytime — I'm here to help."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Invite Email Subject</label>
                  <Input defaultValue="Your transaction portal is ready — {{address}}" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Invite Email Body</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                    rows={4}
                    defaultValue={"Hi {{client_name}},\n\nYour transaction portal for {{address}} is ready. Click the link below to access your documents, track milestones, and message your team.\n\n{{portal_link}}"}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button>Save changes</Button>
                  <Link href="/portal/demo-token-2024" target="_blank">
                    <Button variant="outline" className="gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview Portal
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
