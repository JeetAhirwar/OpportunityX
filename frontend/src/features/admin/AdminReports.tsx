import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

const AdminReports = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <PageHeader title="Reports" description="Platform exports and scheduled reporting" />
    <EmptyState icon={FileText} title="Reports are coming soon" description="CSV exports require a dedicated reporting pipeline. No fake downloads are exposed." />
  </motion.div>
);
export default AdminReports;
