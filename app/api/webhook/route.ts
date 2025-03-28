import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Verify webhook secret if needed
    // const signature = request.headers.get('x-hub-signature-256')
    
    if (payload.ref === 'refs/heads/main') { // or your default branch
      // Execute update script
      await execAsync('bash /opt/update.sh')
      
      // Send notification (you can implement various notification methods)
      await sendNotification({
        title: 'System Update',
        message: `Update received from ${payload.repository.full_name}`,
        type: 'update'
      })
      
      return NextResponse.json({ status: 'Update initiated' })
    }
    
    return NextResponse.json({ status: 'No update needed' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function sendNotification(notification: { title: string; message: string; type: string }) {
  try {
    // You can implement various notification methods here:
    // 1. Email
    // 2. Push notifications
    // 3. System notifications
    // 4. Slack/Discord webhooks
    
    // For now, we'll just log to the system journal
    await execAsync(`logger -t "system-update" "${notification.title}: ${notification.message}"`)
  } catch (error) {
    console.error('Notification error:', error)
  }
} 