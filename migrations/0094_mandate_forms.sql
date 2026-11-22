-- Asking a member for a SEPA mandate and telling them its data (change sepa-mandatsformular): a message of kind
-- mandate_forms carries the mandate form as an attachment (rendered by the worker), one of kind mandate_notices the
-- mandate's data in the text; each with its own system template.
alter table message drop constraint message_kind_check;
alter table message add constraint message_kind_check check (kind in ('free', 'invoices', 'donation_receipts', 'mandate_forms', 'mandate_notices'));
alter table mail_template drop constraint mail_template_key_check;
alter table mail_template add constraint mail_template_key_check check (key in ('invoice', 'dunning', 'invitation', 'login_code', 'change_decided', 'resignation_received', 'application_received', 'application_accepted', 'application_rejected', 'expense_decided', 'donation_receipt', 'birthday', 'anniversary', 'mandate_request', 'mandate_notice'));
