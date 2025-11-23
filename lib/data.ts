// Mock database for the expense tracker
export type Expense = {
  id: number
  date: string
  category: string
  amount: number
  description: string
}

export const expenseDatabase: Expense[] = [
  { id: 1, date: "2025-11-15", category: "Food", amount: 45.5, description: "Grocery shopping" },
  { id: 2, date: "2025-11-16", category: "Transportation", amount: 25.0, description: "Uber to office" },
  { id: 3, date: "2025-11-16", category: "Food", amount: 15.75, description: "Lunch at cafe" },
  { id: 4, date: "2025-11-17", category: "Entertainment", amount: 60.0, description: "Movie tickets" },
  { id: 5, date: "2025-11-18", category: "Food", amount: 32.2, description: "Dinner with friends" },
  { id: 6, date: "2025-11-18", category: "Shopping", amount: 120.0, description: "New shoes" },
  { id: 7, date: "2025-11-19", category: "Food", amount: 8.5, description: "Coffee" },
  { id: 8, date: "2025-11-19", category: "Utilities", amount: 85.0, description: "Internet bill" },
]

export const budgetData: Record<string, number> = {
  Food: 500,
  Transportation: 200,
  Entertainment: 150,
  Shopping: 300,
  Utilities: 250,
}
