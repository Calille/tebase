import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Key,
  Shield,
  Search,
  RefreshCw,
  UserCog,
  Lock,
  Unlock,
  UserX,
  Database,
  Server,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
  Download,
} from "lucide-react";
import { toastDemoAction } from "@/lib/persistence";
import {
  extrasService,
  type ItSystemLog,
  type ItUser,
} from "@/services/extrasService";

const ITDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [users, setUsers] = useState<ItUser[]>([]);
  const [systemLogs, setSystemLogs] = useState<ItSystemLog[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "healthy", uptime: "—", lastBackup: "—" },
    server: { status: "healthy", uptime: "—", load: "—" },
    storage: { status: "healthy", used: "—", total: "—" },
  });

  useEffect(() => {
    extrasService.getItUsers().then(setUsers);
    extrasService.getItLogs().then(setSystemLogs);
    extrasService.getItStatus().then(setSystemStatus);
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle reset password
  const handleResetPassword = (userId: string) => {
    setSelectedUser(userId);
    setIsResetPasswordOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    setSelectedUser(userId);
    setIsDeleteUserOpen(true);
  };

  // Confirm reset password
  const confirmResetPassword = () => {
    toastDemoAction(
      "Password reset",
      "Resetting another user's password needs a server-side admin API. Nothing was changed."
    );
    setIsResetPasswordOpen(false);
    setNewPassword("");
    setSelectedUser(null);
  };

  const confirmDeleteUser = () => {
    toastDemoAction(
      "User deleted",
      "Deleting users needs a server-side admin API. Nothing was changed."
    );
    setIsDeleteUserOpen(false);
    setSelectedUser(null);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "locked":
        return <Badge className="bg-red-100 text-red-800">Locked</Badge>;
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-800">Warning</Badge>;
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          IT Administration
        </h1>
        <p className="text-gray-600">
          Manage users, permissions, and system settings
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System Status
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Logs
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="flex items-center gap-1">
              <UserCog className="h-4 w-4" />
              Add New User
            </Button>
          </div>

          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <Key className="h-3.5 w-3.5" />
                            Reset Password
                          </Button>
                          {user.status === "locked" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-3.5 w-3.5" />
                              Unlock
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Lock
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Role-Based Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Permission</TableHead>
                        <TableHead className="text-center">
                          Trainee Consultant
                        </TableHead>
                        <TableHead className="text-center">
                          Consultant
                        </TableHead>
                        <TableHead className="text-center">
                          Senior Consultant
                        </TableHead>
                        <TableHead className="text-center">Manager</TableHead>
                        <TableHead className="text-center">Director</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          View Schools
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Edit Schools
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          View Bookings
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Edit Bookings
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          View Reports
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Manage Consultants
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          System Settings
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox defaultChecked disabled />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Edit Role Permissions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Custom User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search users..." className="pl-8" />
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-center text-gray-500">
                    Select a user to view and edit their custom permissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                      {systemStatus.database.status === "healthy" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {getStatusBadge(systemStatus.database.status)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">
                      {systemStatus.database.uptime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">
                      {systemStatus.database.lastBackup}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Backup Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Server className="h-5 w-5 text-purple-600" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                      {systemStatus.server.status === "healthy" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {getStatusBadge(systemStatus.server.status)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">
                      {systemStatus.server.uptime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Server Load:</span>
                    <span className="font-medium">
                      {systemStatus.server.load}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Services
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-amber-600" />
                  Storage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                      {systemStatus.storage.status === "healthy" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : systemStatus.storage.status === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {getStatusBadge(systemStatus.storage.status)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Used Space:</span>
                    <span className="font-medium">
                      {systemStatus.storage.used}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Space:</span>
                    <span className="font-medium">
                      {systemStatus.storage.total}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Storage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Scheduled Tasks</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Database Backup</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Runs daily at 3:00 AM
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Log Rotation</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Runs weekly on Sunday at 2:00 AM
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">System Updates</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Current Version</span>
                      </div>
                      <span className="font-medium">v2.5.3</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Last updated: 2023-06-10
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Check for Updates
                      </Button>
                      <Button size="sm">Update System</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">System Backup</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Create a full system backup before making major changes
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Create Backup
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Log Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Enter a new password for the selected user. They will be required
              to change it on next login.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-10"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ITDashboard;
