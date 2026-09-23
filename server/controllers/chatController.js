const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Admin = require('../models/Admin');

const sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const user = req.user;
    const isAdmin = user && user.usertype === 'Admin';
    const queryLower = message.trim().toLowerCase();

    if (isAdmin) {
      // --- ADMIN CONTEXT & METRICS ---
      const totalUsers = await User.countDocuments({ usertype: 'Customer' });
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name title price orderStatus orderDate')
        .exec();

      const products = await Product.find()
        .select('title category price discount')
        .limit(30)
        .exec();

      // Count order statuses
      const statusCounts = await Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]);

      const statusSummary = statusCounts.map(s => `${s._id || 'Pending'}: ${s.count}`).join(', ') || 'No orders yet';
      const recentOrdersSummary = recentOrders.map(o => `- Order "${o.title}" by ${o.name} (₹${o.price}, Status: ${o.orderStatus}, Date: ${o.orderDate})`).join('\n') || 'No recent orders';
      const catalogSummary = products.map(p => `- ${p.title} | ${p.category} | ₹${p.price} (${p.discount || 0}% off)`).join('\n');

      const systemPrompt = `You are the ShopZe Executive AI Assistant for Store Administrators.
Help store admins with:
- Store management metrics (Total Users, Orders, Products)
- Order status breakdown and customer order details
- Inventory and product management
- Sales and promotional strategies

Current Store Data Insights:
- Registered Customers: ${totalUsers}
- Active Products: ${totalProducts}
- Total Orders Placed: ${totalOrders}
- Order Status Breakdown: ${statusSummary}

Recent Orders:
${recentOrdersSummary}

Product Snapshot:
${catalogSummary}

Provide clear, professional, concise, and structured answers tailored for an e-commerce administrator.`;

      try {
        if (!process.env.OPENROUTER_API_KEY) throw new Error('No API Key');
        const reply = await callOpenRouter(systemPrompt, history, message);
        return res.status(200).json({ reply, role: 'Admin' });
      } catch (err) {
        // Dynamic Fallback for Admin
        let fallbackReply = '';
        if (queryLower.includes('stat') || queryLower.includes('overview') || queryLower.includes('dashboard') || queryLower.includes('summary') || queryLower.includes('performance')) {
          fallbackReply = `📊 **ShopZe Store Overview**:\n- **Registered Customers**: ${totalUsers}\n- **Active Products**: ${totalProducts}\n- **Total Orders**: ${totalOrders}\n- **Order Status Breakdown**: ${statusSummary}`;
        } else if (queryLower.includes('order') || queryLower.includes('sale')) {
          fallbackReply = `📦 **Recent Store Orders** (${recentOrders.length} recent shown of ${totalOrders} total):\n` +
            (recentOrders.map(o => `• **${o.title}** - ₹${o.price} | Customer: ${o.name} | Status: *${o.orderStatus}*`).join('\n') || 'No orders found.');
        } else if (queryLower.includes('user') || queryLower.includes('customer') || queryLower.includes('people')) {
          fallbackReply = `👥 **Customer Metrics**:\n- Total registered customers: **${totalUsers}**.\nTo view the full customer list, navigate to **Admin Dashboard > All Users**.`;
        } else if (queryLower.includes('product') || queryLower.includes('inventory') || queryLower.includes('catalog') || queryLower.includes('stock')) {
          fallbackReply = `🏷️ **Catalog Overview**:\n- Total products listed: **${totalProducts}**.\nSample catalog products:\n` +
            (products.slice(0, 5).map(p => `• **${p.title}** (${p.category}) - ₹${p.price} [${p.discount}% OFF]`).join('\n') || 'No products listed.');
        } else {
          fallbackReply = `🛡️ **Admin Executive Assistant**: I can help you monitor store performance! Try asking about:\n- *"Store overview"* or *"Stats"*\n- *"Recent orders"*\n- *"Product catalog summary"*\n- *"Customer metrics"*`;
        }
        return res.status(200).json({ reply: fallbackReply, role: 'Admin' });
      }
    } else {
      // --- CUSTOMER / GUEST CONTEXT ---
      const products = await Product.find()
        .select('title category gender price discount sizes description mainImg')
        .limit(50)
        .exec();

      let customerOrders = [];
      if (user && user.id) {
        customerOrders = await Order.find({ userId: user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title price orderStatus orderDate deliveryDate size quantity')
          .exec();
      }

      const availableCategories = Array.from(new Set(products.map(p => p.category))).join(', ') || 'Mobiles, Electronics, Sports-Equipment, Fashion, Groceries';

      const catalogSummary = products
        .map(p => `- ${p.title} | Category: ${p.category} | Gender: ${p.gender || 'Unisex'} | Price: ₹${p.price} (${p.discount}% off)`)
        .join('\n');

      const userOrdersSummary = customerOrders.length > 0
        ? customerOrders.map(o => `- Order "${o.title}" (Qty: ${o.quantity}, Price: ₹${o.price}) - Status: ${o.orderStatus}, Date: ${o.orderDate}`).join('\n')
        : 'No previous orders found for this user.';

      const systemPrompt = `You are a friendly shopping assistant for ShopZe online store.
Help customers with:
- Product recommendations, price checks, discounts, sizes
- Checking order tracking and delivery status
- General shopping help, payment info, shipping policy

Store Categories: ${availableCategories}

Current Product Catalog:
${catalogSummary}

Customer Order History:
${userOrdersSummary}

Keep responses concise, friendly, and helpful. Recommend real products from the catalog.`;

      try {
        if (!process.env.OPENROUTER_API_KEY) throw new Error('No API Key');
        const reply = await callOpenRouter(systemPrompt, history, message);
        return res.status(200).json({ reply, role: 'Customer' });
      } catch (err) {
        // Dynamic Intelligent Fallback Engine for Customer & Guest
        let fallbackReply = '';

        // 1. Greetings / Intro
        if (/^(hi|hello|hey|greetings|good morning|good evening|good afternoon|who are you|what can you do)/i.test(queryLower)) {
          fallbackReply = `👋 **Hi ${user?.username ? user.username : 'there'}!** I'm your ShopZe AI Assistant.\n\nI can help you with:\n• 🛍️ Finding products & categories\n• 🔥 Discovering top discount deals\n• 📦 Tracking your recent orders\n• 🚚 Delivery & payment options`;
        }
        // 2. Order Tracking
        else if (queryLower.includes('track') || queryLower.includes('order') || queryLower.includes('status') || queryLower.includes('my order')) {
          if (!user) {
            fallbackReply = `🔒 Please log in to your ShopZe account to view and track your orders.`;
          } else if (customerOrders.length === 0) {
            fallbackReply = `📦 You haven't placed any orders yet. Check out our **Products** page to place your first order!`;
          } else {
            fallbackReply = `📦 **Your Recent Orders**:\n` +
              customerOrders.map(o => `• **${o.title}** (₹${o.price}) — Status: *${o.orderStatus}* | Date: ${o.orderDate}`).join('\n');
          }
        }
        // 3. Discount Deals & Offers
        else if (queryLower.includes('discount') || queryLower.includes('offer') || queryLower.includes('sale') || queryLower.includes('deal') || queryLower.includes('cheap')) {
          const discounted = products.filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount).slice(0, 5);
          if (discounted.length > 0) {
            fallbackReply = `🔥 **Top Discount Deals on ShopZe**:\n` +
              discounted.map(p => `• **${p.title}** — ₹${Math.round(p.price * (1 - p.discount / 100))} (*${p.discount}% OFF*, MRP ₹${p.price})`).join('\n');
          } else {
            fallbackReply = `✨ Explore our catalog! We have items across categories: **${availableCategories}**.`;
          }
        }
        // 4. Categories & Types
        else if (queryLower.includes('category') || queryLower.includes('categories') || queryLower.includes('department') || queryLower.includes('types')) {
          fallbackReply = `🛍️ **ShopZe Product Categories**:\nAvailable categories: **${availableCategories}**.\n\nYou can click on any category on the home page or filter on the **Products** page!`;
        }
        // 5. Shipping / Delivery / Return Policies
        else if (queryLower.includes('shipping') || queryLower.includes('deliver') || queryLower.includes('policy') || queryLower.includes('return') || queryLower.includes('dispatch')) {
          fallbackReply = `🚚 **ShopZe Delivery & Policy**:\n- **Free Shipping**: Available on orders above ₹499.\n- **Delivery Time**: Usually delivered in **3 to 5 business days**.\n- **Easy Returns**: 7-day hassle-free return/replacement policy for defective or damaged products.`;
        }
        // 6. Payment Options
        else if (queryLower.includes('pay') || queryLower.includes('payment') || queryLower.includes('cod') || queryLower.includes('card') || queryLower.includes('upi') || queryLower.includes('checkout') || queryLower.includes('netbanking')) {
          fallbackReply = `💳 **Payment Options Supported on ShopZe**:\n- 💵 **Cash on Delivery (COD)**\n- 📱 **UPI** (Google Pay, PhonePe, Paytm)\n- 💳 **Credit / Debit Cards**\n- 🏦 **Net Banking**`;
        }
        // 7. Support / Contact
        else if (queryLower.includes('help') || queryLower.includes('support') || queryLower.includes('contact') || queryLower.includes('email') || queryLower.includes('phone')) {
          fallbackReply = `📞 **Customer Support**:\nNeed assistance? Contact our team at **support@shopze.com** or call us at **1800-123-4567** (Mon-Sat 9AM-6PM).`;
        }
        // 8. Specific Product / Category Query Search
        else {
          const ignoreWords = new Set(['what', 'where', 'when', 'which', 'show', 'have', 'want', 'find', 'look', 'need', 'does', 'some', 'that', 'this', 'with', 'your', 'from', 'tell', 'about', 'price', 'cost', 'much']);
          const searchTokens = queryLower
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length >= 3 && !ignoreWords.has(w));

          let matched = [];
          if (searchTokens.length > 0) {
            matched = products.filter(p =>
              searchTokens.some(w =>
                (p.title && p.title.toLowerCase().includes(w)) ||
                (p.category && p.category.toLowerCase().includes(w)) ||
                (p.description && p.description.toLowerCase().includes(w))
              )
            );
          }

          if (matched.length > 0) {
            fallbackReply = `🔎 **Found matching products for you**:\n` +
              matched.slice(0, 5).map(p => {
                const finalP = Math.round(p.price * (1 - (p.discount || 0) / 100));
                return `• **${p.title}** (${p.category}) — ₹${finalP} ${p.discount > 0 ? `[${p.discount}% OFF]` : ''}`;
              }).join('\n');
          } else {
            fallbackReply = `🛍️ I'm here to help! Try asking me:\n- *"Show discount deals"*\n- *"What categories are available?"*\n- *"Track my recent order"*\n- *"Payment & shipping policies"*`;
          }
        }

        return res.status(200).json({ reply: fallbackReply, role: 'Customer' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Chatbot is temporarily unavailable.' });
  }
};

async function callOpenRouter(systemPrompt, history, message) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history : []),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response returned.';
}

module.exports = { sendMessage };