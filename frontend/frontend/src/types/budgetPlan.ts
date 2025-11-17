import React, { useState, useEffect } from 'react';
export interface BudgetPlan 
{

  
  PlanID: number;
  Year: number;
  Department: string; // <-- lowercase
  EstimatedReplacementCost: number;
  Approved: boolean;
  foo:string; // <-- Add this line
}
const [budgetPlan, setBudgetPlan] = useState<BudgetPlan>({
  PlanID: 0,
  Year: new Date().getFullYear(),
  Department: '',
  
  EstimatedReplacementCost: 0,
  Approved: false,
  foo: '', // <-- Add this line (or a suitable default value)
});
``