# [C++游戏开发基础:this指针的那点事]

如果你没有其他面向对象的编程语言基础,比如`Java`、`c#`等,那么你在学习C++面向对象时可能会好奇,当一个成员函数被调用的时候,C++是如何跟踪它被调用的对象的?

考虑下面的程序:

```cpp
#include <iostream>

class Simple
{
private:
    int m_id{};

public:
    Simple(int id)
        : m_id{ id }
    {
    }

    int getID() const { return m_id; }
    void setID(int id) { m_id = id; }

    void print() const { std::cout << m_id; }
};

int main()
{
    Simple simple{1};
    simple.setID(2);

    simple.print();

    return 0;
}
```

对于上述代码,当我们调用 `simple.setID（2）;` 时，C++知道函数 `setID（）` 应该对对象 `simple 进行`操作，并且 `m_id` 实际上引用了 `simple.m_id`。

为什么会这样?这因为C++使用了一个名为`this`的隐藏指针。

---

## 隐藏的this指针

在每一个成员函数中,关键字`this`是一个常量指针,它保存当前隐式对象的地址。因此,下面两种写法是等效的;

```cpp
void print() const {std::cout <<m_id;}
void print() const {std::cout <<this->m_id;}
```

但是事实证明,前者是后者的简写。当我们程序编译时,编译器将隐式地在引用隐式对象的任何成员前面加上`this->` 。 这有助于我们的代码跟更简洁,而不需要一遍遍的重复`this->`

> 我们使用 `->` 从指向对象的指针中选择成员。`this->m_id` 相当于 `（*this）.m_id`。

---

## this底层实现

回顾下面函数的调用:

```cpp
simple.setID(2);
```

虽然对函数`setID(2)`的调用表面上看起来好像就一个参数,但实际上有两个。在编译时,编译器会重写表达式`simple.setID(2)`:

```cpp
Simple::simple(&simple,2);
```

同理,由于函数的调用现在增加了一个参数,那么成员函数定义也需要进行调整以适应接受此参数。下面是`setID()`的原始定义:

```cpp
void setID(int id) {m_id = id;}
```

编译器重写之后的结果可能是下面这样的:

```cpp
static void setID(Simple* const this,int id)
{
  this->m_id = id;
}
```

⚠️注意,重写后的函数参数多了一个`this`参数,它是一个常量指针。使用`this`指针,`m_id`成员也被重写为`this->m_id`;

> 在这种情况下,关键字`static`意味着函数与类的对象无关,而是被视为类作用域内的普通函数。

所以总结一下就是:

- 当我们调用 `simple.setID（2）` 时，编译器实际上调用 `Simple：：setID（simple，2）`，`simple` 通过地址传递给函数。
- 函数有一个名为 `this 的`隐藏参数，它接收 `simple` 的地址。
- `setID（）`中的成员变量以 `this-> 为`前缀，它指向 `simple`。因此，当编译器`计算`->m_id时 ，它实际上是解析为 `simple.m_id`。

> 在 C++ 中，所有非静态成员函数（即类的成员函数）都有一个隐含的指针 this，它指向当前对象（即调用该成员函数的对象）的地址。

**非静态成员函数**：

非静态成员函数是与某个具体对象相关的函数，它们依赖于对象的状态（成员变量）。这些函数不能独立于类的对象存在，需要通过对象来调用。

---

## 显式的引用this

大多数时候,我们不需要显式的引用`this`。 但是,在一些特定情况下这样做是个不错的选择。

首先,如果你有一个成员函数,它有一个与数据成员同名的参数,那么你可以通过这种方式来消除歧义:

```cpp
struct Something
{
    int data{}; 

    void setData(int data)
    {
        this->data = data; 
    }
};
```

这个 `Something` 类有一个名为 `data 的`成员。`setData（）` 的函数参数也被命名为 `data`。在 `setData（）` 函数中，`data` 引用函数参数（因为函数参数隐藏了数据成员），所以如果我们想引用`数据`成员，可以使用 `this->data`。

有些程序员习惯使用这样的写法,可能是由于Java的习惯,但是在C++中,并不建议这样做,还是推荐之前说过的使用`m_`前缀来区分私有成员和非成员变量。 

其次,有时让成员函数将隐式对象作为返回值返回也是很有用的。这样做的主要原因是允许成员函数可以被链式调用。

这被称为 **函数链或者方法链** ;

考虑下面的例子:

```cpp
class Calc
{
private:
    int m_value{};

public:

    void add(int value) { m_value += value; }
    void sub(int value) { m_value -= value; }
    void mult(int value) { m_value *= value; }

    int getValue() const { return m_value; }
};
```

基于上述写法,如果你现在想要执行加6减2乘以3,那么你必须这样做:

```cpp
#include <iostream>

int main()
{
    Calc calc{};
    calc.add(2); 
    calc.sub(2); 
    calc.mult(3); 

    std::cout << calc.getValue() << '\n';

    return 0;
}
```

但是,如果我们通过引用使每个函数返回`*this`,就可以将调用链接在一起。

```cpp
class Calc
{
private:
    int m_value{};

public:
    Calc& add(int value) { m_value += value; return *this; }
    Calc& sub(int value) { m_value -= value; return *this; }
    Calc& mult(int value) { m_value *= value; return *this; }

    int getValue() const { return m_value; }
};
```

因此,我们可以像下面这样进行链式调用:

```cpp
#include <iostream>

int main()
{
    Calc calc{};
    calc.add(6).sub(2).mult(3); 

    std::cout << calc.getValue() << '\n';

    return 0;
}
```

首先，调用 `calc.add（5）`，它将 `m_value` 加上 `5`。`add（）` 然后返回一个对 `*this 的`引用，这是对隐式对象 `calc` 的引用，因此 `calc` 将是后续计算中使用的对象。下一个 `calc.sub（3）` 求值，从 `m_value` 中减去 `3`，并再次返回 `calc . sub`（3）。最后，`calc.mult（4）` 将 `m_value` 乘以 `4` 并返回 `calc`，它不会被进一步使用，因此被忽略。

由于每个函数在执行时都会修改 `calc`，` 因此 calc` 的 `m_value` 现在包含值（0 + 5）- 3）* 4），即 `8`。

> 因为`它`总是指向隐式对象，所以在解引用它之前，我们不需要检查它是否是空指针。

---

## 重置类的默认状态

如果你的类有一个默认的构造函数,你可能会提供一种方法来将现有的对象重置到它默认的状态。但是之前说过,构造函数仅用于初始化新对象,不应直接调用。这样做会导致意外的行为。

所以要实现上面重置状态的需求,最佳的方法是创建一个类似于`reset()`这样的函数, 让该函数创建一个新对象(使用默认构造函数),然后将该新对象复制给当前隐式对象。

```cpp
void reset()
{
  *this = {};
}
```

下面是一个完整的示例:

```cpp
#include <iostream>

class Calc
{
private:
    int m_value{};

public:
    Calc& add(int value) { m_value += value; return *this; }
    Calc& sub(int value) { m_value -= value; return *this; }
    Calc& mult(int value) { m_value *= value; return *this; }

    int getValue() const { return m_value; }

    void reset() { *this = {}; }
};


int main()
{
    Calc calc{};
    calc.add(5).sub(3).mult(4);

    std::cout << calc.getValue() << '\n'; // prints 8

    calc.reset();

    std::cout << calc.getValue() << '\n'; // prints 0

    return 0;
}
```

---

## this和const对象的关系

- 对于非`const`成员函数,`this`是一个指向非`const`值的`cosn`指针。(这意味着`this`不能指向其他对象,但指向的对象可以被修改)。 

- 对于`const`成员函数,`this`是一个指向`const`值的`const`指针(意味着指针不能指向其他对象,也不能修改被指向的对象)。

## 为什么this是指针而不是引用?

和Java以及C#不同,`this`在C++中出现的时候,`C++`还没有引入引用这种东西(🤪)!

---

## 往期推荐
- [游戏算法基础- A星寻路](https://www.ilikexff.cn/articles/163)
- [构造函数8000字长文浅析](https://www.ilikexff.cn/articles/161)