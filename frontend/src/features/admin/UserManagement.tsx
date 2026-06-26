import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Plus, Search, Shield, ShieldOff, Trash2, UserCog, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import api from "@/services/api";
import { AdminUser, createAdminUser, getAdminUsers, unwrapAdminData } from "@/features/admin/adminApi";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";

type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  role: AdminUser["role"];
};

const initialForm: CreateUserForm = {
  name: "",
  email: "",
  password: "",
  role: "candidate",
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(initialForm);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getAdminUsers());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => users.filter((item) => {
    const query = search.toLowerCase();
    return (!query || item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query))
      && (roleFilter === "all" || item.role === roleFilter);
  }), [roleFilter, search, users]);

  const updateStatus = async (item: AdminUser) => {
    try {
      const updated = unwrapAdminData(await api.patch<unknown>(`/admin/users/${item._id}/status`, { isActive: !item.isActive })) as AdminUser;
      setUsers((all) => all.map((user) => user._id === item._id ? updated : user));
      toast({ title: updated.isActive ? "User reactivated" : "User suspended" });
    } catch (requestError) {
      toast({ title: "Could not update user", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const changeRole = async (item: AdminUser, role: AdminUser["role"]) => {
    if (item.role === role) return;
    const adminChange = item.role === "admin" || role === "admin";
    const confirmed = adminChange
      ? window.confirm(`Confirm changing ${item.name}'s role from ${item.role} to ${role}.`)
      : window.confirm(`Change ${item.name}'s role to ${role}?`);
    if (!confirmed) return;

    try {
      const updated = unwrapAdminData(await api.patch<unknown>(`/admin/users/${item._id}/role`, {
        role,
        confirm: item._id === currentUser?._id && role !== "admin",
      })) as AdminUser;
      setUsers((all) => all.map((user) => user._id === item._id ? updated : user));
      toast({ title: "User role updated" });
    } catch (requestError) {
      toast({ title: "Could not change role", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const deleteUser = async (item: AdminUser) => {
    const adminDelete = item.role === "admin"
      ? " This will remove an admin account."
      : "";
    if (!window.confirm(`Permanently delete ${item.name}?${adminDelete}`)) return;
    try {
      await api.delete(`/admin/users/${item._id}`);
      setUsers((all) => all.filter((user) => user._id !== item._id));
      toast({ title: "User deleted" });
    } catch (requestError) {
      toast({ title: "Could not delete user", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const submitCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await createAdminUser(form);
      setUsers((all) => [created, ...all]);
      setForm(initialForm);
      setDialogOpen(false);
      toast({ title: created.role === "admin" ? "Admin created" : "User created" });
      await loadUsers();
    } catch (requestError) {
      toast({ title: "Could not create user", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="User Management" description="Manage platform users and permissions" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="candidate">Candidate</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create User/Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User/Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={(event) => void submitCreateUser(event)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-user-name">Name</Label>
                <Input id="admin-user-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-user-email">Email</Label>
                <Input id="admin-user-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-user-password">Password</Label>
                <Input id="admin-user-password" type="password" minLength={8} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(role: AdminUser["role"]) => setForm((current) => ({ ...current, role }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>{creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading users...</div>
        : error ? <EmptyState icon={AlertCircle} title="Could not load users" description={error} />
        : !filtered.length ? <EmptyState icon={Users} title="No users found" description="No users match the current filters." />
        : <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border text-left"><th className="px-5 py-3 text-xs uppercase text-muted-foreground">User</th><th className="px-5 py-3 text-xs uppercase text-muted-foreground">Role</th><th className="px-5 py-3 text-xs uppercase text-muted-foreground">Status</th><th className="px-5 py-3 text-xs uppercase text-muted-foreground">Joined</th><th className="px-5 py-3 text-xs uppercase text-muted-foreground">Actions</th></tr></thead><tbody>
          {filtered.map((item) => {
            const self = item._id === currentUser?._id;
            return <tr key={item._id} className="border-b border-border/50"><td className="px-5 py-4"><p className="font-medium">{item.name}{self ? " (You)" : ""}</p><p className="text-xs text-muted-foreground">{item.email}</p></td><td className="px-5 py-4 text-sm capitalize">{item.role}</td><td className="px-5 py-4"><StatusBadge status={item.isActive ? "active" : "suspended"} /></td><td className="px-5 py-4 text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={self} onClick={() => void updateStatus(item)}>{item.isActive ? <ShieldOff className="h-4 w-4 text-destructive" /> : <Shield className="h-4 w-4 text-success" />}</Button>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><UserCog className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => void changeRole(item, "candidate")}>Set Candidate</DropdownMenuItem><DropdownMenuItem onClick={() => void changeRole(item, "recruiter")}>Set Recruiter</DropdownMenuItem><DropdownMenuItem onClick={() => void changeRole(item, "admin")}>Set Admin</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              <Button variant="ghost" size="sm" disabled={self} className="text-destructive" onClick={() => void deleteUser(item)}><Trash2 className="h-4 w-4" /></Button>
            </div></td></tr>;
          })}
        </tbody></table></div></CardContent></Card>}
    </motion.div>
  );
};

export default UserManagement;
