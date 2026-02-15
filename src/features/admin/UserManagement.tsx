import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, ShieldOff, UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

const mockUsers: UserItem[] = [
  { id: "1", name: "Alice Johnson", email: "alice@email.com", role: "candidate", status: "Active", joined: "Jan 1, 2026" },
  { id: "2", name: "Bob Smith", email: "bob@corp.com", role: "recruiter", status: "Active", joined: "Dec 15, 2025" },
  { id: "3", name: "Carol Davis", email: "carol@email.com", role: "candidate", status: "Blocked", joined: "Nov 20, 2025" },
  { id: "4", name: "Dan Wilson", email: "dan@startup.io", role: "recruiter", status: "Pending", joined: "Feb 1, 2026" },
  { id: "5", name: "Eve Martinez", email: "eve@email.com", role: "candidate", status: "Active", joined: "Feb 10, 2026" },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleBlock = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "Blocked" ? "Active" : "Blocked" } : u));
  };

  const changeRole = (id: string, role: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="User Management" description="Manage platform users and permissions" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="candidate">Candidate</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">User</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Role</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Joined</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{user.name.charAt(0)}</div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize">{user.role}</td>
                    <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleBlock(user.id)}>
                          {user.status === "Blocked" ? <Shield className="h-4 w-4 text-success" /> : <ShieldOff className="h-4 w-4 text-destructive" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><UserCog className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => changeRole(user.id, "candidate")}>Set Candidate</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeRole(user.id, "recruiter")}>Set Recruiter</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeRole(user.id, "admin")}>Set Admin</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserManagement;
