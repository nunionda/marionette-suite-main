# Vagrantfile — Marionette Studios Production Pipeline
# Purpose: Safe sandbox for running team agents with --dangerously-skip-permissions
# Reference: https://blog.emilburzo.com/2026/01/running-claude-code-dangerously-safely/
#
# Usage:
#   vagrant up          # First boot (provision ~5 min)
#   vagrant ssh         # Enter VM
#   claude --dangerously-skip-permissions -p "..."   # Dispatch team agent
#   exit && vagrant suspend    # Pause VM (fast resume next time)
#   vagrant destroy     # Nuclear reset if VM is broken

vm_name = "marionette-" + File.basename(Dir.getwd)

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-24.04"
  config.vm.hostname = vm_name

  # Project directory synced into VM — two-way sync
  # Claude edits /agent-workspace inside VM → changes appear on host immediately
  config.vm.synced_folder ".", "/agent-workspace", type: "virtualbox"

  # Port forwards for local dev servers (uncomment as needed per sprint)
  # config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true   # apps/web
  # config.vm.network "forwarded_port", guest: 4000, host: 4000, auto_correct: true   # apps/scenario-web
  # config.vm.network "forwarded_port", guest: 4005, host: 4005, auto_correct: true   # apps/scenario-api
  # config.vm.network "forwarded_port", guest: 5432, host: 5432, auto_correct: true   # PostgreSQL

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "6144"   # 6 GB — headroom for Bun + Next.js + PostgreSQL + Claude
    vb.cpus = 4
    vb.gui = false
    vb.name = vm_name
    vb.customize ["modifyvm", :id, "--audio", "none"]
    vb.customize ["modifyvm", :id, "--usb", "off"]
    # Fix VirtualBox 7.2.4 idle CPU regression
    vb.customize ["modifyvm", :id, "--nested-hw-virt", "on"]
  end

  config.vm.provision "shell", inline: <<-SHELL
    export DEBIAN_FRONTEND=noninteractive

    echo "==> Updating apt..."
    apt-get update -qq

    echo "==> Installing system dependencies..."
    apt-get install -y -qq \
      docker.io \
      nodejs \
      npm \
      git \
      unzip \
      curl \
      postgresql \
      postgresql-contrib \
      build-essential

    echo "==> Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> /home/vagrant/.bashrc
    echo 'export PATH="/root/.bun/bin:$PATH"' >> /root/.bashrc
    ln -sf /root/.bun/bin/bun /usr/local/bin/bun || true

    echo "==> Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code --no-audit --quiet

    echo "==> Configuring Docker access..."
    usermod -aG docker vagrant
    systemctl enable docker
    systemctl start docker

    echo "==> Setting up PostgreSQL..."
    systemctl enable postgresql
    systemctl start postgresql
    # Create default marionette DB and user
    sudo -u postgres psql -c "CREATE USER marionette WITH PASSWORD 'marionette' CREATEDB;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE marionette OWNER marionette;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE scenario OWNER marionette;" 2>/dev/null || true

    echo "==> Fixing workspace permissions..."
    chown -R vagrant:vagrant /agent-workspace

    echo "==> Installing workspace dependencies..."
    cd /agent-workspace
    sudo -u vagrant /usr/local/bin/bun install --frozen-lockfile 2>/dev/null || true

    echo ""
    echo "============================================"
    echo "  Marionette Studios Agent VM Ready"
    echo "  Project: /agent-workspace"
    echo "  Claude:  claude --dangerously-skip-permissions"
    echo "  Docs:    /agent-workspace/docs/team-plans/"
    echo "============================================"
  SHELL

  # After provision: set ANTHROPIC_API_KEY from host if available
  config.vm.provision "shell", run: "always", inline: <<-SHELL
    if [ -f /home/vagrant/.anthropic_key ]; then
      echo 'export ANTHROPIC_API_KEY=$(cat /home/vagrant/.anthropic_key)' >> /home/vagrant/.bashrc
    fi
    echo "VM started. cd /agent-workspace && claude --dangerously-skip-permissions"
  SHELL
end
