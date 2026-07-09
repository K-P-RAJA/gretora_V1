using Npgsql;

namespace Gretora.API.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public NpgsqlConnection CreateConnection()
        {
            return new NpgsqlConnection(_connectionString);
        }

        public void InitializeDatabase()
        {
            try
            {
                using var connection = CreateConnection();
                connection.Open();
                using var cmd = connection.CreateCommand();
                cmd.CommandText = @"
                    CREATE TABLE IF NOT EXISTS public.support_tickets (
                      id UUID NOT NULL DEFAULT gen_random_uuid(),
                      name TEXT NOT NULL,
                      email TEXT NOT NULL,
                      subject TEXT NULL,
                      message TEXT NOT NULL,
                      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
                      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                    CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
                      CONSTRAINT chk_ticket_status CHECK (status IN ('Pending', 'Resolved'))
                    );

                    -- Ensure columns and constraints exist in support_tickets (in case table existed before)
                    ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS subject TEXT NULL;
                    ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'Pending';
                    ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

                    DO $$ 
                    BEGIN 
                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ticket_status') THEN
                            ALTER TABLE public.support_tickets ADD CONSTRAINT chk_ticket_status CHECK (status IN ('Pending', 'Resolved'));
                        END IF;
                    END $$;

                    CREATE TABLE IF NOT EXISTS public.system_logs (
                      id UUID NOT NULL DEFAULT gen_random_uuid(),
                      level VARCHAR(50) NOT NULL,
                      source VARCHAR(50) NOT NULL,
                      message TEXT NOT NULL,
                      details TEXT NULL,
                      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                      CONSTRAINT system_logs_pkey PRIMARY KEY (id)
                    );

                    CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
                ";
                cmd.ExecuteNonQuery();
                Console.WriteLine("[Database Service] Database initialized successfully (support_tickets and system_logs tables verified).");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Database Service Init Error] {ex.Message}");
            }
        }
    }
}
