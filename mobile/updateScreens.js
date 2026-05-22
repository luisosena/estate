const fs = require('fs');
const path = require('path');

const d = 'c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/mobile/src/screens';
const walk = (dir) => {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res.push(...walk(p));
    else if (f.endsWith('.tsx')) res.push(p);
  });
  return res;
};

const files = walk(d);
let updatedCount = 0;

files.forEach(p => {
  let code = fs.readFileSync(p, 'utf8');
  if (code.includes('ErrorState')) return;
  if (!code.includes('ScreenContainer')) return;
  
  let originalCode = code;

  // Add import
  if (code.includes("import { ScreenContainer }")) {
    code = code.replace(/import \{ ScreenContainer \} from '([^']+)';/, "import { ScreenContainer } from '$1';\nimport { ErrorState } from '$1/../ErrorState';");
  }

  // Add state
  if (code.includes("const [refreshing, setRefreshing] = useState(false);")) {
    code = code.replace(/const \[refreshing, setRefreshing\] = useState\(false\);/, "const [refreshing, setRefreshing] = useState(false);\n  const [error, setError] = useState<string | null>(null);");
  } else if (code.includes("const [loading, setLoading] = useState(true);")) {
    code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);");
  } else {
    // maybe no state? skip injecting error if we can't find a place
  }

  // update catch
  code = code.replace(/catch \(error\) \{/g, "catch (err: any) {");
  code = code.replace(/console\.error\('(.*?)', error\);/g, "console.error('$1', err);\n      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');");

  // set error null on fetch
  code = code.replace(/setLoading\(true\);/, "setLoading(true);\n      setError(null);");

  const m = code.match(/const (fetch\w+|load\w+) = (async )?\(/);
  const fn = m ? m[1] : '() => {}';

  const inject = `
  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={${fn}} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer`;

  code = code.replace(/ {2}return \(\s*<ScreenContainer/, inject);

  if (code !== originalCode) {
    fs.writeFileSync(p, code);
    console.log('Updated ' + p);
    updatedCount++;
  }
});

console.log('Total updated: ' + updatedCount);
