import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, MapPin, BookmarkPlus, Clock, DollarSign, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const allJobs = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: ["Senior React Developer", "Product Designer", "Data Scientist", "DevOps Engineer", "Marketing Manager", "Backend Engineer", "UX Researcher", "Mobile Developer", "Project Manager", "QA Engineer", "ML Engineer", "Frontend Developer"][i % 12],
  company: ["TechCorp", "DesignHub", "AI Labs", "CloudScale", "GrowthCo", "ServerPro", "UserFirst", "AppWorks", "ProManage", "QualityTech", "DeepLearn", "WebStudio"][i % 12],
  location: ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Chicago, IL", "Remote", "Boston, MA", "Los Angeles, CA", "Denver, CO", "Portland, OR", "Miami, FL", "Remote"][i % 12],
  type: ["Full-time", "Full-time", "Full-time", "Contract", "Full-time", "Full-time", "Part-time", "Full-time", "Full-time", "Contract", "Full-time", "Full-time"][i % 12],
  salary: `$${100 + (i % 12) * 10}K - $${140 + (i % 12) * 10}K`,
  salaryNum: 100 + (i % 12) * 10,
  remote: i % 3 === 0,
  experience: ["Senior", "Mid", "Senior", "Mid", "Senior", "Mid", "Junior", "Mid", "Senior", "Mid", "Senior", "Junior"][i % 12],
  posted: `${(i % 12) + 1}d ago`,
  postedDays: (i % 12) + 1,
  logo: ["TC", "DH", "AL", "CS", "GC", "SP", "UF", "AW", "PM", "QT", "DL", "WS"][i % 12],
  tags: [["React", "TypeScript"], ["Figma", "UI/UX"], ["Python", "ML"], ["AWS", "Docker"], ["SEO", "Analytics"], ["Node.js", "Go"], ["Research", "Analytics"], ["React Native", "Swift"], ["Agile", "Scrum"], ["Selenium", "Jest"], ["PyTorch", "NLP"], ["Vue", "CSS"]][i % 12],
}));

const ITEMS_PER_PAGE = 10;

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState([50, 250]);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let jobs = allJobs;
    if (searchQuery) jobs = jobs.filter((j) => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase()));
    if (locationQuery) jobs = jobs.filter((j) => j.location.toLowerCase().includes(locationQuery.toLowerCase()));
    if (selectedTypes.length) jobs = jobs.filter((j) => selectedTypes.includes(j.type));
    if (selectedLevels.length) jobs = jobs.filter((j) => selectedLevels.includes(j.experience));
    if (selectedModes.length) {
      jobs = jobs.filter((j) => {
        if (selectedModes.includes("Remote") && j.remote) return true;
        if (selectedModes.includes("On-site") && !j.remote) return true;
        return false;
      });
    }
    jobs = jobs.filter((j) => j.salaryNum >= salaryRange[0] && j.salaryNum <= salaryRange[1]);
    if (sortBy === "recent") jobs = [...jobs].sort((a, b) => a.postedDays - b.postedDays);
    if (sortBy === "salary-high") jobs = [...jobs].sort((a, b) => b.salaryNum - a.salaryNum);
    return jobs;
  }, [searchQuery, locationQuery, selectedTypes, selectedLevels, selectedModes, salaryRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Job Type</h3>
        <div className="space-y-2">
          {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox id={`type-${type}`} checked={selectedTypes.includes(type)} onCheckedChange={() => { toggleFilter(selectedTypes, type, setSelectedTypes); setPage(1); }} />
              <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Experience Level</h3>
        <div className="space-y-2">
          {["Junior", "Mid", "Senior", "Lead"].map((level) => (
            <div key={level} className="flex items-center gap-2">
              <Checkbox id={`level-${level}`} checked={selectedLevels.includes(level)} onCheckedChange={() => { toggleFilter(selectedLevels, level, setSelectedLevels); setPage(1); }} />
              <Label htmlFor={`level-${level}`} className="text-sm">{level}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Work Mode</h3>
        <div className="space-y-2">
          {["Remote", "On-site"].map((mode) => (
            <div key={mode} className="flex items-center gap-2">
              <Checkbox id={`mode-${mode}`} checked={selectedModes.includes(mode)} onCheckedChange={() => { toggleFilter(selectedModes, mode, setSelectedModes); setPage(1); }} />
              <Label htmlFor={`mode-${mode}`} className="text-sm">{mode}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Salary Range</h3>
        <Slider value={salaryRange} onValueChange={(v) => { setSalaryRange(v); setPage(1); }} min={0} max={500} step={10} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>${salaryRange[0]}K</span><span>${salaryRange[1]}K</span></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="border-b border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Job title, keyword, or company" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="City, state, or remote" value={locationQuery} onChange={(e) => { setLocationQuery(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <Button className="gradient-primary border-0" onClick={() => setPage(1)}>Search</Button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> jobs found</p>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
              <Sheet>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="md:hidden"><SlidersHorizontal className="h-4 w-4" /></Button></SheetTrigger>
                <SheetContent side="left"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><FilterSidebar /></div></SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 md:block"><div className="sticky top-24"><FilterSidebar /></div></aside>
          <div className="flex-1 space-y-4">
            {paginated.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No jobs match your search criteria.</p>
                <Button variant="link" onClick={() => { setSearchQuery(""); setLocationQuery(""); setSelectedTypes([]); setSelectedLevels([]); setSelectedModes([]); setSalaryRange([50, 250]); setPage(1); }}>Clear all filters</Button>
              </div>
            )}
            {paginated.map((job, i) => (
              <motion.div key={`${job.id}-${page}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="group transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">{job.logo}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link to={`/jobs/${job.id}`} className="font-display font-semibold hover:text-primary transition-colors">{job.title}</Link>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"><BookmarkPlus className="h-4 w-4" /></Button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.posted}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                          <Badge variant="secondary" className="text-xs">{job.experience}</Badge>
                          {job.remote && <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs">Remote</Badge>}
                          {job.tags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button size="sm" className="gradient-primary border-0 text-xs" asChild><Link to={`/jobs/${job.id}`}>View & Apply</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} size="sm" className="hidden sm:inline-flex" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
                <span className="text-sm text-muted-foreground sm:hidden">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
