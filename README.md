# Cloak

This is the pitch deck for Cloak, a cap designed to stop cameras and microphones from recording the person wearing it. The slideshow runs in your web browser, and this guide walks you through opening it on your own computer, step by step.

You don't need a GitHub account or any programming experience. The first time takes about 10 minutes. After that, it takes about a minute.

## What you'll need

- A Mac or Windows computer with an internet connection
- A web browser. Google Chrome works best, but Safari, Edge and Firefox work too.

## Step 1: Download the slideshow

1. Go to **https://github.com/Appiest/cloak** in your web browser.
2. Click the green **Code** button near the top right of the file list.
3. Click **Download ZIP** at the bottom of the menu that opens. You don't need to sign in.
4. Find the downloaded file, called `cloak-main.zip`, in your Downloads folder, and unzip it.
   - **Mac:** double-click `cloak-main.zip`. A folder called `cloak-main` appears next to it.
   - **Windows:** right-click `cloak-main.zip`, choose **Extract All…**, then click **Extract**. A folder called `cloak-main` opens.

Keep the `cloak-main` folder somewhere you can find it, such as your Desktop or Downloads folder.

## Step 2: Install Node.js (only needed once)

The slideshow needs a free program called Node.js to run.

1. Go to **https://nodejs.org**.
2. Click the big download button marked **LTS**, which is the stable version.
3. Open the file you downloaded and click through the installer, keeping all the default choices. On a Mac, it may ask for your computer password. That's normal.
4. When the installer finishes, **restart your computer**. This makes sure the next steps can find Node.js.

If you've installed Node.js before, you can skip this step, as long as it's version 20.9 or newer.

## Step 3: Open a command window inside the slideshow folder

You'll type two short commands into a text window called the Terminal (on a Mac) or the Command Prompt (on Windows). Here's how to open it in the right folder.

**On a Mac:**

1. Press **Command + Space**, type **Terminal**, and press **Return**. A window with a blinking cursor opens.
2. Type `cd` followed by a single space. Don't press Return yet.
3. Drag the `cloak-main` folder from Finder into the Terminal window and let go. The folder's location appears after `cd `.
4. Press **Return**.

**On Windows:**

1. Open the `cloak-main` folder in File Explorer. You should see files like `package.json` and `README.md` inside.
2. Click once on the address bar at the top of the window, where the folder path is shown, so the path turns blue.
3. Type `cmd` and press **Enter**. A black Command Prompt window opens, already pointed at the folder.

**Check you're in the right place.** Type `ls` (Mac) or `dir` (Windows) and press Return or Enter. You should see `package.json` and `README.md` in the list. If you don't, see "Nothing happens, or ENOENT" at the bottom of this guide.

## Step 4: Install the slideshow's parts (only needed once)

In the window you just opened, type the following and press **Return** (Mac) or **Enter** (Windows):

```
npm install
```

This downloads everything the slideshow needs. It usually takes one to three minutes, and lots of text will scroll past. Yellow "warn" lines are normal. Wait until the blinking cursor comes back on a new line.

## Step 5: Start the slideshow

Type the following and press **Return** or **Enter**:

```
npm run present
```

This prepares the slideshow, which takes about a minute. It's ready when you see a line like this:

```
✓ Ready in ...
```

Leave this window open while you watch the slideshow. Closing it stops the slideshow.

**On Windows**, a security window may ask whether to let Node.js through the firewall. The slideshow only runs on your own computer, so you can click **Cancel** or **Allow**.

## Step 6: Open it in your browser

Open your web browser and go to:

**http://localhost:3000**

The title slide appears and loops until you start.

## Presenting

| To do this | Press |
| --- | --- |
| Go forward | Right arrow, space bar, or click anywhere |
| Go back | Left arrow |
| Enter or leave full screen | F |
| Jump to the first or last slide | Home or End |

Most slides reveal in steps, so each press brings in the next part.

The address bar keeps track of where you are. For example, `http://localhost:3000/present?slide=4&beat=2` opens slide 4 at its second step, which is handy for rehearsing one section.

## When you're done

Click on the Terminal or Command Prompt window and press **Control + C** to stop the slideshow. Then you can close the window.

## Watching it again later

You only need to do steps 1, 2 and 4 once. Next time:

1. Open a command window inside the `cloak-main` folder (step 3).
2. Type `npm run present` and press Return or Enter (step 5).
3. Go to **http://localhost:3000** (step 6).

## If something goes wrong

**"npm: command not found" or "'npm' is not recognized"**

Your computer can't find Node.js yet. Restart your computer, then open a new command window (step 3) and try again. If it still happens, repeat step 2.

**Nothing happens, or "npm error code ENOENT"**

The command window isn't pointed at the right folder, so npm can't find the file called `package.json`. Sometimes unzipping creates a `cloak-main` folder inside another `cloak-main` folder. Use the inner one, the one that directly contains `package.json`, and redo step 3.

**"Port 3000 is already in use" or "EADDRINUSE"**

Another program is using the same address, often a slideshow you started earlier and didn't stop. Close any other command windows and try again. If that doesn't help, type this instead of `npm run present`:

```
npm run build
npx next start --port 3001
```

Then go to **http://localhost:3001** in your browser.

**The page is blank or says "This site can't be reached"**

Check that the command window is still open and shows "Ready". If you closed it, start again from step 3.

---

## For developers

The deck is a Next.js app (TypeScript, Tailwind CSS and Motion), and it lives at `/present`.

```sh
npm install
npm run dev     # development server with hot reload
npm run check   # typecheck, lint (including a complexity limit) and tests
```

Each slide is a set of beats in `src/deck/script.ts`. Scene elements in `src/deck/scenes` read the current beat and animate to it, so shapes carry over from one slide to the next. Every on-screen figure cites an entry in `src/deck/sources.ts`.
