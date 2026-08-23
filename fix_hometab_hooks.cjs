const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetHooks = `    if (!matchToCancel) {
      const rescheduleRef = useRef(handleRescheduleUnplayedMatches);
  useEffect(() => {
    rescheduleRef.current = handleRescheduleUnplayedMatches;
  }, [handleRescheduleUnplayedMatches]);

  useEffect(() => {
    const listener = (e: any) => {
      setTimeout(() => {
        if (rescheduleRef.current) rescheduleRef.current(e.detail);
      }, 500);
    };
    window.addEventListener('triggerReschedule', listener);
    return () => window.removeEventListener('triggerReschedule', listener);
  }, []);

  return (`;

const replaceHooks = `    if (!matchToCancel) {
      return (`;

content = content.replace(targetHooks, replaceHooks);

const targetHomeTabTop = `  const [substitutePlayerId, setSubstitutePlayerId] = useState<string>("");`;

const replaceHomeTabTop = `  const [substitutePlayerId, setSubstitutePlayerId] = useState<string>("");

  const rescheduleRef = useRef(handleRescheduleUnplayedMatches);
  useEffect(() => {
    rescheduleRef.current = handleRescheduleUnplayedMatches;
  }, [handleRescheduleUnplayedMatches]);

  useEffect(() => {
    const listener = (e: any) => {
      setTimeout(() => {
        if (rescheduleRef.current) rescheduleRef.current(e.detail);
      }, 500);
    };
    window.addEventListener('triggerReschedule', listener);
    return () => window.removeEventListener('triggerReschedule', listener);
  }, []);
`;

content = content.replace(targetHomeTabTop, replaceHomeTabTop);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed HomeTab hooks");
