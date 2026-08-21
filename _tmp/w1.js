const fs = require("fs");
let c = "";
c += "\"use client\";

";
c += "import { useState, useEffect } from \"react\";
";
c += "import { Building2, Shield, Clock, AlertTriangle, MapPin, CheckCircle2, Activity, X, Pencil, Trash2, Copy } from \"lucide-react\";
";
c += "import { AppShell } from \"@/components/layout/app-shell\";
";
c += "import { Button } from \"@/components/ui/button\";

";
fs.writeFileSync("_tmp/c.txt", c);
console.log("Wrote part 1");