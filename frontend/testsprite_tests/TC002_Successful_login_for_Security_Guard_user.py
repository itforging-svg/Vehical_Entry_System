import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5174", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Find and navigate to the login page or reveal the login form
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        await page.mouse.wheel(0, -await page.evaluate('() => window.innerHeight'))
        

        # -> Try to open a new tab and navigate directly to a common login page URL or try to find a login link in the app
        await page.goto('http://localhost:5174/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input valid Guard username and password and click login button
        frame = context.pages[-1]
        # Input valid Guard username
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testUser')
        

        frame = context.pages[-1]
        # Input valid Guard password
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testPassword123')
        

        frame = context.pages[-1]
        # Click login button to initialize session
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Log out from Super Admin and navigate to login page to test Security Guard login
        frame = context.pages[-1]
        # Click Logout button to log out from Super Admin session
        elem = frame.locator('xpath=html/body/div/div/div/header/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to login page to test Security Guard login
        await page.goto('http://localhost:5174/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input valid Security Guard username and password and click login button
        frame = context.pages[-1]
        # Input valid Security Guard username
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testUser')
        

        frame = context.pages[-1]
        # Input valid Security Guard password
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testPassword123')
        

        frame = context.pages[-1]
        # Click login button to initialize session
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Log out from Super Admin and try to find or use Security Guard credentials to test login and role-based access for Security Guard
        frame = context.pages[-1]
        # Click Logout button to log out from Super Admin session
        elem = frame.locator('xpath=html/body/div/div/div/header/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select 'Vehicle Entry System' portal and click 'PROCEED TO ACCESS' to reach login page
        frame = context.pages[-1]
        # Select 'Vehicle Entry System' portal
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'PROCEED TO ACCESS' button to proceed to login
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=VEHICLE ENTRY GATEWAY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CHANDAN STEEL LTD').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ADMIN LOGIN').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=VERIFICATION FEED').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ACTIVATE SCANNER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SESSION START').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=23-01-2026 14:57').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=VERIFICATION SAMPLES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0 Frames').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=EVIDENCE LOGS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No photos captured in this session').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Gate Pass Registration').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Verify driver documents and vehicle health before issuing pass').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DRIVER FULL NAME').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LICENCE NUMBER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DRIVER MOBILE NO').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AADHAR CARD NO').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=VEHICLE CLASSIFICATION').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LMV (Sedan/SUV)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LMV (Pickup)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LMV (Tempo)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HV (Truck)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HV (Hydra)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HV (JCB)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HV (Dumper)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HV (Trailer)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=REGISTRATION NUMBER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CHALLAN NO').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PUC VALIDITY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=INSURANCE VALIDITY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CHASSIS (LAST 5)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ENGINE (LAST 5)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRANSPORTER / PARTY NAME').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PLANT / DIVISION').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Seamless Division').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Forging Division').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Main Plant').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bright Bar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Flat Bar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Wire Plant').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Main Plant 2 ( SMS 2 )').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=40"Inch Mill').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PURPOSE OF ENTRY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=MATERIAL LOAD DETAILS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SECURITY PERSON NAME').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CONFIRM ENTRY & ISSUE PASS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CHANDAN STEEL LIMITED | INTEGRATED LOGISTICS CONTROL V24.1').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    