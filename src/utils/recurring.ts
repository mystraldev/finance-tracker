import type {
  FinanceData,
  RecurringOccurrence,
  RecurringRule,
  RecurringSkip,
} from '../types/finance'
import { dateForMonthDay, isMonthKey } from './validation'

export function recurringOccurrenceId(ruleId: string, month: string): string {
  return `${ruleId}:${month}`
}

export function recurringOccurrenceDate(rule: RecurringRule, month: string): string {
  return dateForMonthDay(month, rule.dayOfMonth)
}

export function recurringRuleApplies(rule: RecurringRule, month: string): boolean {
  if (!rule.active || rule.frequency !== 'monthly' || !isMonthKey(month)) return false
  if (month < rule.startMonth) return false
  if (rule.endMonth && month > rule.endMonth) return false
  return true
}

export function recurringOccurrences(data: FinanceData, month: string): RecurringOccurrence[] {
  return data.recurringRules
    .filter((rule) => recurringRuleApplies(rule, month))
    .map((rule) => {
      const activity = findConfirmedActivity(data, rule.id, month)
      const skipped = isSkipped(data.recurringSkips, rule.id, month)
      const status: RecurringOccurrence['status'] = activity
        ? 'confirmed'
        : skipped
          ? 'skipped'
          : 'pending'
      return {
        id: recurringOccurrenceId(rule.id, month),
        rule,
        month,
        date: recurringOccurrenceDate(rule, month),
        status,
        activityId: activity?.id,
      }
    })
    .sort((a, b) => {
      if (a.date === b.date) return a.rule.description.localeCompare(b.rule.description, 'es')
      return a.date < b.date ? -1 : 1
    })
}

export function isSkipped(skips: RecurringSkip[], ruleId: string, month: string): boolean {
  return skips.some((skip) => skip.ruleId === ruleId && skip.month === month)
}

function findConfirmedActivity(data: FinanceData, ruleId: string, month: string) {
  return (
    data.transactions.find(
      (transaction) =>
        transaction.recurringRuleId === ruleId &&
        transaction.recurrenceMonth === month,
    ) ??
    data.transfers.find(
      (transfer) =>
        transfer.recurringRuleId === ruleId &&
        transfer.recurrenceMonth === month,
    )
  )
}
