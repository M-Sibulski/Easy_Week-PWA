import { db } from "../db";
import { Transactions } from "../types";

const csvToJson = (csv:string) => {
    // console.log(csv)
    const lines = csv.trim().split('\n');
    if (!lines[0].includes(',')) return csv;
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const obj: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
        obj[headers[j].replace('\r','')] = values[j].replace('\r','');
        }
        result.push(obj);
        
    }
    
    return JSON.stringify(result, null, 2); // Stringify for pretty-printed JSON
}

const transactionsBulkAdd = async (transactions: Transactions[], accountId: number) => {
    const answer = confirm("This will replace all transactions on this account. Confirm?")
    if (answer) {
        const existingTransactions = await db.transactions.where("account_id").equals(accountId).toArray();
        existingTransactions.map(t => db.transactions.delete(t.id));
        transactions.map(async a => {
            try{
                const id = await db.transactions.add(a)
            } catch(error) {
                console.log(error)
                return
            }
        })
    }
}

const jsonToDB = async (file:File | undefined, accountId: number) => {
    if (!file) return;

    try {
      let text = await file.text();
      text = csvToJson(text);
      const parsed: Transactions[] = JSON.parse(text);
      parsed.map(t => {
        t.account_id = accountId;
        t.value = Number(t.value);
        t.date = new Date(t.date);
    })

      if (!Array.isArray(parsed)) {
        alert("JSON should be an array of objects.");
        return;
      }

      transactionsBulkAdd(parsed, accountId);
    } catch (error) {
      alert("Invalid JSON file.");
      
      console.error(error);
    }
    
}

export default jsonToDB;