#include <stdio.h>
#include <stdlib.h>
#include <vector>
#include <chrono>
#include<iostream>
#include <math.h>

double gravity = 0.001;

class Point
{
public:
    double x = 0.0;
    double y = 0.0;

    Point(double _x, double _y) : x(_x), y(_y)
    {
    }
};

class Ball : public Point
{
public:
    double r = 5.0;
    double velx = 0.0;
    double vely = 0.0;
    double accx = 0.0;
    double accy = 0.0;
    double nvelx = 0.0;
    double nvely = 0.0;

    Ball(double _x, double _y) : Point(_x,_y)
    {
    }

    void update(double dt)
    {
        velx += accx * dt;
        vely += accy * dt;
        x += velx * dt;
        y += vely * dt;

        double dist = sqrt( velx * velx + vely * vely);
        nvelx = velx / dist;
        nvely = vely / dist;
    }
};

class Game
{
public:
    double tick = 20.0;
    double fudgeRange = 25.0;
    double fudgeY = 0.0;
    bool hitTarget = false;
    double targetx = 0.0;
    double targety = 0.0;
    Ball* ball = nullptr;
    std::vector<Ball*> pegs;

    int tracePtr = 0;
    std::vector<Point*> trace;

    Game()
    {
    }

    ~Game()
    {
        if (ball) delete ball;
        for (Ball* peg: pegs)
        {
            delete peg;
        }
        pegs.clear();
        for (Point* point: trace)
        {
            delete point;
        }
        trace.clear();
    }

    void init()
    {
        ball = new Ball(201.0,0.0);
        ball->r = 10.0;

        int offset = 0;
        for (int j = 0; j < 10; ++j)
        {
            for (int i = 0; i < 10; ++i)
            {
                pegs.push_back(new Ball(100.0+offset +50.0 * j, 200.0 + 50.0 * i));
                offset = (offset + 25) % 50;
            }
        }

        tracePtr = 0;
        for (int i = 0; i < 2000; ++i)
        {
            trace.push_back( new Point(0,0) );
        }
    }

    double getTick(double y)
    {
        if (abs(y - fudgeY) <= fudgeRange) return tick;
        return 20.0;
    }

    void doTrace(double x, double y)
    {
        Ball* tracer = new Ball(x, y);
        tracer->r = ball->r;
        tracer->accy = gravity;
        tracePtr = 0;
        hitTarget = false;
        while (tracer->y < 1000.0)
        {
            if (tracePtr >= 2000) break;
            if (tracer->x < 0.0) break;
            if (tracer->x > 800.0) break;
            trace[tracePtr]->x = tracer->x;
            trace[tracePtr]->y = tracer->y;
            tracePtr += 1;
            if (targetx)
            {
                if ((abs(tracer->x - targetx) <= 10.0) &&
                    (abs(tracer->y - targety) <= 10.0))
                {
                    hitTarget = true;
                }
            }
            tracer->update( getTick(tracer->y) );
            collision(tracer);
        }
    }

    Ball wallpeg = Ball(0,0);

    void collision(Ball* ball)
    {
        // check for wall collision
        double wallhit = 0;
        if (ball->x < 80 + ball->r) wallhit = 1;
        if (ball->x > 595 - ball->r) wallhit = 2;
        if (wallhit)
        {
            double x = (wallhit == 1) ? 75 : 600;
            wallpeg.x = x;
            wallpeg.y = ball->y;
            if (rebound(ball, &wallpeg)) { return; }
        }

        // check all pegs
        for (Ball* peg : pegs)
        {
            // note this math lets the ball phase through pegs

            if (peg->y + 50 < ball->y) continue;  // its well past
            if (peg->x + 50 < ball->x) continue;  // its not close
            if (peg->x - 50 > ball->x) continue;  // its not close

            double minx = peg->x - peg->r;
            double miny = peg->y - peg->r;
            double maxx = peg->x + peg->r;
            double maxy = peg->y + peg->r;
            double bminx = ball->x - ball->r;
            double bminy = ball->y - ball->r;
            double bmaxx = ball->x + ball->r;
            double bmaxy = ball->y + ball->r;
            bool hitx = false;
            bool hity = false;
            // ball in the peg
            if (minx < bminx && bminx <= maxx) hitx = true;
            else if (minx < bmaxx && bmaxx <= maxx) hitx = true;
            if (miny < bminy && bminy <= maxy) hity = true;
            else if (miny < bmaxy && bmaxy <= maxy) hity = true;
            // peg in the ball
            if (bminx < minx && minx <= bmaxx) hitx = true;
            else if (bminx < maxx && maxx <= bmaxx) hitx = true;
            if (bminy < miny && miny <= bmaxy) hity = true;
            else if (bminy < maxy && maxy <= bmaxy) hity = true;
            if (!hitx || !hity) continue;

            if (rebound(ball, peg)) return;
        }
    }

    bool rebound(Ball* ball, Ball* peg)
    {
            // move the ball back to the contact point
            double dist = sqrt( (peg->x - ball->x) * (peg->x - ball->x) + (peg->y - ball->y) * (peg->y - ball->y)  );
            double reqDist = peg->r + ball->r;
            double overlap = reqDist - dist;
            if (overlap < 0.1) return false;
            double pullbackX = ball->nvelx * overlap;
            double pullbackY = ball->nvely * overlap;
            ball->x -= pullbackX;
            ball->y -= pullbackY;
            // get the vector of reflection (center to center)
            double refX = ball->x - peg->x;
            double refY = ball->y - peg->y;
            dist = sqrt( refX * refX + refY * refY );
            refX = refX / dist;
            refY = refY / dist;
            // get incident vector
            // - its Game.ball->vec
            // get bounce vector
            double dot = ball->velx * refX + ball->vely * refY;
            double bounceX = ball->velx - 2 * dot * refX;
            double bounceY = ball->vely - 2 * dot * refY;
            // decay / bounciness
            bounceX *= 0.75;
            bounceY *= 0.75;
            // carry on
            ball->velx = bounceX;
            ball->vely = bounceY;
            // avoid vertical bouncebacks
            if (refX == 0 && refY == -1) ball->velx += 0.001;
            return true;
    }

    double solve(bool deep)
    {
        auto begin = std::chrono::high_resolution_clock::now();
        int round = 0;
        double step = deep ? 20 : 50;
        double smallstep = 2; //deep ? 1 : 2;

        fudgeY = 0;
        tick = 20;
        hitTarget = false;

        for (double start = 0; start < 10; start += smallstep)
        {
            round += 1;
            for (double y = 670 + start; y > 50; y -= step)
            {
                for (double x = 10; x < 30; x += smallstep)
                {
                    fudgeY = y;
                    tick = x;
                    doTrace(ball->x, 0);
                    if (hitTarget) break;

                    if (!deep)
                    {
                        auto end = std::chrono::high_resolution_clock::now();
                        auto dur = end - begin;
                        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(dur).count();
                        if (ms > 200)
                        {
                            tracePtr = 0;
//                            puts("Took too long: Failed");
                            return 0;
                        }
                    }
                }
                if (hitTarget) break;
            }
            if (hitTarget) break;
            if (!deep) break;
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto dur = end - begin;
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(dur).count();
        return ms;
//        std::cout << "Solve took: " << ms << " ms - rounds: " << round << std::endl;
//        std::cout << (hitTarget ? "Found" : "Failed") << std::endl;
    }

    void draw()
    {
        char pixels[160][100];
        memset(pixels,0, sizeof(char)*160*100);
        for (int i = 0; i < tracePtr; ++i)
        {
            Point* p = trace[i];
            int x = floor(p->x / 5);
            int y = floor(p->y / 10);
            pixels[x][y] = 1;
        }
        puts("");
        for (int y = 0; y < 100; ++y)
        {
            for (int x = 0; x < 160; ++x)
            {
                putchar( pixels[x][y] ? 'o' : ' ');
            }
            putchar('\n');
        }
        puts("");
    }

    void analyze(bool deep)
    {
        auto begin = std::chrono::high_resolution_clock::now();

        double fail = 0;
        double find = 0;
        double low = 9999;
        double high = 0;
        double sum = 0;
        double total = 0;

        bool results[500];
        memset(results,0,sizeof(bool)*500);

        for (int x = 90; x < 585; ++x)
        {
            ball->x = x;
            ball->y = 0;
            double ms = solve(deep);
            if (ms > high) high = ms;
            if (ms && ms < low) low = ms;
            if (ms) { sum += ms; total += 1; }
            if (hitTarget) find += 1; else fail += 1;

            results[x] = hitTarget;
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto dur = end - begin;
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(dur).count();
        double perc = floor( fail / (find + fail) * 100 );
        std::cout << "analyze: fails in " << perc << "% spots - " << ms << " ms" << std::endl;
        std::cout << "Lowest: " << low << " ms - Highest: " << high << " ms - Average: " << floor(sum/total) << "ms" << std::endl;

        double fail0 = 0;
        double fail1 = 0;
        double fail2 = 0;
        double fail2away = 0;
        double fail3away = 0;
        double fail2deep = 0;
        for (int x = 90; x < 585; ++x)
        {
            if (results[x]) continue;
            if (results[x-1] && results[x+1]) fail2 += 1;
            else if (results[x-1] || results[x+1]) fail1 += 1;
            else {
                fail0 += 1;
                if (results[x-2] || results[x+2]) fail2away += 1;
                else if (results[x-3] || results[x+3]) fail3away += 1;
                else {
                    ball->x = x;
                    ball->y = 0;
                    double ms = solve(true);
                    if (hitTarget) fail2deep += 1;
                    else
                    {
                        std::cout << "bad one: x = " << x << std::endl;
                    }
                }
            }
        }
        std::cout << "Fails with 2 good neighbours: " << fail2 << std::endl;
        std::cout << "Fails with 1 good neighbours: " << fail1 << std::endl;
        std::cout << "Fails with 0 good neighbours: " << fail0 << std::endl;
        std::cout << "  Fails with solution 2 away: " << fail2away << std::endl;
        std::cout << "  Fails with solution 3 away: " << fail3away << std::endl;
        std::cout << "  Fails with deep solution: " << fail2deep << std::endl;
        std::cout << "  Unhandled fails: " << (fail0-fail2away-fail2deep-fail3away) << std::endl;

    }
};


int main()
{
    int ballx = 100;
    int targetx = 100;
    int targety = 600;

    std::cout << "Ball X: ";
    scanf("%d", &ballx);
    std::cout << "Target X: ";
    scanf("%d", &targetx);
    std::cout << "Target Y: ";
    scanf("%d", &targety);

    Game game;
    game.init();
    game.targetx = targetx;
    game.targety = targety;

    if (ballx > 80)
    {
        game.ball->x = ballx;
        game.solve(true);
        game.draw();
    }
    else game.analyze( ballx ? true : false);
}
