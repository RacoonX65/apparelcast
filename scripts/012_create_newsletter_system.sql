-- Newsletter System Tables
-- This script creates tables for newsletter subscriptions and email notifications

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_notifications table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, bounced
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);

CREATE INDEX IF NOT EXISTS idx_email_notifications_email ON email_notifications(email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_discount_code ON email_notifications(discount_code_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for newsletter_subscribers: Allow public to insert (subscribe)
CREATE POLICY "Allow public to subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT TO public
    WITH CHECK (true);

-- Policy for newsletter_subscribers: Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription" ON newsletter_subscribers
    FOR SELECT TO authenticated
    USING (email = auth.email());

-- Policy for newsletter_subscribers: Allow users to update their own subscription
CREATE POLICY "Users can update their own subscription" ON newsletter_subscribers
    FOR UPDATE TO authenticated
    USING (email = auth.email());

-- Policy for newsletter_subscribers: Allow admins to view all subscriptions
CREATE POLICY "Admins can view all newsletter subscriptions" ON newsletter_subscribers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Policy for newsletter_subscribers: Allow admins to manage all subscriptions
CREATE POLICY "Admins can manage all newsletter subscriptions" ON newsletter_subscribers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Policy for email_notifications: Only admins can view and manage
CREATE POLICY "Only admins can view email notifications" ON email_notifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Only admins can manage email notifications" ON email_notifications
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Add updated_at trigger for newsletter_subscribers
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- Add updated_at trigger for email_notifications
CREATE OR REPLACE FUNCTION update_email_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_notifications_updated_at
    BEFORE UPDATE ON email_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_email_notifications_updated_at();

-- Function to automatically notify subscribers when a new discount code is created
CREATE OR REPLACE FUNCTION notify_subscribers_of_new_discount()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger for active discount codes
    IF NEW.is_active = true THEN
        -- Insert a notification record for each active subscriber
        INSERT INTO email_notifications (email, subject, content, discount_code_id, status)
        SELECT 
            ns.email,
            '🎉 New Discount Code: Save ' || 
            CASE 
                WHEN NEW.discount_type = 'percentage' THEN NEW.discount_value::text || '%'
                ELSE 'R' || NEW.discount_value::text
            END || '!',
            'New discount code available: ' || NEW.code,
            NEW.id,
            'pending'
        FROM newsletter_subscribers ns
        WHERE ns.is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically notify subscribers
CREATE TRIGGER discount_code_notification_trigger
    AFTER INSERT ON discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION notify_subscribers_of_new_discount();

-- Grant necessary permissions
GRANT SELECT, INSERT ON newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT ON email_notifications TO authenticated;

-- Comments for documentation
COMMENT ON TABLE newsletter_subscribers IS 'Stores email addresses of users who subscribed to the newsletter for discount notifications';
COMMENT ON TABLE email_notifications IS 'Tracks all email notifications sent to subscribers, including discount code notifications';

COMMENT ON COLUMN newsletter_subscribers.email IS 'Email address of the subscriber';
COMMENT ON COLUMN newsletter_subscribers.is_active IS 'Whether the subscription is active (not unsubscribed)';
COMMENT ON COLUMN newsletter_subscribers.unsubscribed_at IS 'Timestamp when the user unsubscribed';

COMMENT ON COLUMN email_notifications.status IS 'Status of the email: pending, sent, failed, bounced';
COMMENT ON COLUMN email_notifications.discount_code_id IS 'Reference to the discount code this notification is about';
COMMENT ON COLUMN email_notifications.error_message IS 'Error message if email sending failed';