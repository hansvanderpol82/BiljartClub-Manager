const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const searchState = `  const [transactionDate, setTransactionDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );`;
const replaceState = `  const [transactionDate, setTransactionDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [transactionReceipt, setTransactionReceipt] = useState<string | null>(null);
  const [transactionReceiptError, setTransactionReceiptError] = useState<string>("");
  const [showClosedSeasons, setShowClosedSeasons] = useState(false);
  const [collapsedCashbookSeasons, setCollapsedCashbookSeasons] = useState<string[]>([]);`;

content = content.replace(searchState, replaceState);

fs.writeFileSync('src/App.tsx', content);
