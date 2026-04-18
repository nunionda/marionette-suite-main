import { mockBudgets } from "../../../lib/budget/mock-entries";
import { BudgetClient } from "./budget-client";

export default function Page() {
  return <BudgetClient budgets={mockBudgets} />;
}
